from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

from apps.accounts.models import User
from apps.requests_app.models import ProductRequest
from apps.journeys.models import Journey
from apps.deliveries.models import DeliveryOrder, DeliveryOTP
from apps.matching.engine import calculate_route_match

class RouteMateCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create requester
        self.requester = User.objects.create_user(
            username='test_requester',
            email='requester@test.com',
            password='Password123!',
            role='REQUESTER'
        )

        # Create traveller
        self.traveller = User.objects.create_user(
            username='test_traveller',
            email='traveller@test.com',
            password='Password123!',
            role='TRAVELLER'
        )

        # Create admin
        self.admin = User.objects.create_superuser(
            username='test_admin',
            email='admin@test.com',
            password='Password123!',
            role='ADMIN'
        )

    def test_user_registration_prevents_admin_role_escalation(self):
        """Users registering through public API cannot self-assign ADMIN role"""
        data = {
            'username': 'attacker',
            'email': 'attacker@test.com',
            'password': 'Password123!',
            'confirm_password': 'Password123!',
            'role': 'ADMIN',
            'terms_accepted': True
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(username='attacker')
        # Role must be sanitized to REQUESTER
        self.assertEqual(created_user.role, 'REQUESTER')
        self.assertFalse(created_user.is_staff)

    def test_jwt_login_and_role_redirect(self):
        """Login with username/email returns valid JWT and role-based redirect"""
        response = self.client.post('/api/auth/login/', {
            'credential': 'test_requester',
            'password': 'Password123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertEqual(response.data['dashboard_redirect'], '/requester/dashboard')

    def test_route_matching_engine_corridor_accuracy(self):
        """Warangal to Hyderabad journey matches Warangal to Hyderabad request with high score"""
        today = timezone.now().date()
        journey = Journey.objects.create(
            traveller=self.traveller,
            origin_city='Warangal',
            destination_city='Hyderabad',
            departure_datetime=timezone.now() + timedelta(days=1),
            estimated_arrival_datetime=timezone.now() + timedelta(days=1, hours=4),
            carrying_capacity_kg=Decimal('5.00')
        )

        req = ProductRequest.objects.create(
            requester=self.requester,
            product_name='Warangal Brass Lantern',
            pickup_city='Warangal',
            destination_city='Hyderabad',
            max_budget=Decimal('1500.00'),
            traveller_reward=Decimal('300.00'),
            required_delivery_date=today + timedelta(days=2)
        )

        match_res = calculate_route_match(journey, req)
        self.assertTrue(match_res['is_match'])
        self.assertGreaterEqual(match_res['match_score'], 80)
        self.assertEqual(match_res['pickup_compatibility'], 'EXACT_ORIGIN')
        self.assertEqual(match_res['destination_compatibility'], 'EXACT_DESTINATION')

    def test_atomic_request_acceptance_and_otp_lifecycle(self):
        """Traveller accepts request, generates OTP for requester only, and confirms delivery"""
        today = timezone.now().date()
        req = ProductRequest.objects.create(
            requester=self.requester,
            product_name='Specialty Filter Coffee Powder',
            pickup_city='Chikmagalur',
            destination_city='Bangalore',
            max_budget=Decimal('800.00'),
            traveller_reward=Decimal('250.00'),
            required_delivery_date=today + timedelta(days=3)
        )

        # Authenticate as traveller
        self.client.force_authenticate(user=self.traveller)
        accept_resp = self.client.post(f'/api/deliveries/accept/{req.id}/')
        self.assertEqual(accept_resp.status_code, status.HTTP_201_CREATED)

        delivery_id = accept_resp.data['delivery']['id']
        delivery = DeliveryOrder.objects.get(id=delivery_id)
        self.assertEqual(delivery.status, 'ACCEPTED')

        # Requester checks delivery: OTP must be visible to requester
        self.client.force_authenticate(user=self.requester)
        req_view = self.client.get(f'/api/deliveries/{delivery_id}/')
        otp_code = req_view.data.get('requester_otp')
        self.assertIsNotNone(otp_code)
        self.assertEqual(len(otp_code), 6)

        # Traveller checks delivery: OTP must NOT be leaked to traveller
        self.client.force_authenticate(user=self.traveller)
        trav_view = self.client.get(f'/api/deliveries/{delivery_id}/')
        self.assertIsNone(trav_view.data.get('requester_otp'))

        # Traveller enters wrong OTP -> rejected
        wrong_resp = self.client.post(f'/api/deliveries/{delivery_id}/confirm-otp/', {'otp_code': '000000'})
        self.assertEqual(wrong_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Traveller enters correct OTP -> marked DELIVERED and reward settled
        confirm_resp = self.client.post(f'/api/deliveries/{delivery_id}/confirm-otp/', {'otp_code': otp_code})
        self.assertEqual(confirm_resp.status_code, status.HTTP_200_OK)
        delivery.refresh_from_db()
        self.assertEqual(delivery.status, 'DELIVERED')

