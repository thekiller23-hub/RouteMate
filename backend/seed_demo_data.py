import os
import sys
import django
from decimal import Decimal
from datetime import timedelta
from django.utils import timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.profiles.models import UserProfile, TravellerVerification
from apps.requests_app.models import ProductRequest
from apps.journeys.models import Journey
from apps.deliveries.models import DeliveryOrder, DeliveryStatusHistory, DeliveryOTP
from apps.payments.models import Payment, PaymentTransaction, TravellerEarning
from apps.notifications.models import Notification
from apps.reviews.models import Review
from apps.matching.engine import calculate_route_match
from apps.matching.models import RouteMatch

def seed():
    print("Seeding RouteMate initial demo data...")

    # 1. Admin Account
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@routemate.com',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': 'ADMIN',
            'is_staff': True,
            'is_superuser': True,
            'is_identity_verified': True,
            'is_phone_verified': True,
        }
    )
    if created:
        admin.set_password('Admin@12345')
        admin.save()
        UserProfile.objects.create(user=admin, bio='RouteMate Platform Administrator')
        print("Created Admin: admin / Admin@12345")
    else:
        print("Admin already exists.")

    # 2. Requester Account
    req_user, created = User.objects.get_or_create(
        username='requester_demo',
        defaults={
            'email': 'priya.sharma@example.com',
            'first_name': 'Priya',
            'last_name': 'Sharma',
            'role': 'REQUESTER',
            'phone_number': '+919876543210',
            'is_phone_verified': True,
        }
    )
    if created:
        req_user.set_password('Requester@12345')
        req_user.save()
        UserProfile.objects.create(
            user=req_user,
            bio='Product enthusiast looking for regional specialties and urgent supplies.',
            city='Hyderabad',
            state='Telangana',
            address='Road No. 12, Banjara Hills'
        )
        print("Created Requester: requester_demo / Requester@12345")

    # 3. Traveller Account
    traveller_user, created = User.objects.get_or_create(
        username='traveller_demo',
        defaults={
            'email': 'rahul.varma@example.com',
            'first_name': 'Rahul',
            'last_name': 'Varma',
            'role': 'TRAVELLER',
            'phone_number': '+919876543211',
            'is_phone_verified': True,
            'is_identity_verified': True,
        }
    )
    if created:
        traveller_user.set_password('Traveller@12345')
        traveller_user.save()
        UserProfile.objects.create(
            user=traveller_user,
            bio='Frequent business traveller between Warangal, Hyderabad, and Bangalore. Happy to deliver parcels safely.',
            city='Warangal',
            state='Telangana',
            address='Subedari, Hanamkonda',
            average_rating=Decimal('4.92'),
            completed_deliveries_count=14
        )
        TravellerVerification.objects.create(
            user=traveller_user,
            document_type='AADHAAR',
            id_number='XXXX-XXXX-4589',
            status='VERIFIED',
            reviewed_at=timezone.now(),
            reviewer_notes='Government photo ID verified.'
        )
        print("Created Traveller: traveller_demo / Traveller@12345")

    # 4. Product Requests
    today = timezone.now().date()
    
    # Request 1: Warangal -> Hyderabad (Open for matching)
    req1, _ = ProductRequest.objects.get_or_create(
        product_name='Warangal Brass Dhokra Art Lamp',
        requester=req_user,
        defaults={
            'product_category': 'HANDICRAFTS',
            'product_description': 'Traditional bell metal craft lamp made by local artisans. Carefully packed in a protective box.',
            'product_source': 'LOCAL_MARKET',
            'pickup_address': 'Artisan Guild, Hanamkonda Market',
            'pickup_city': 'Warangal',
            'pickup_lat': 17.9689,
            'pickup_lng': 79.5941,
            'destination_address': 'Road No. 12, Banjara Hills',
            'destination_city': 'Hyderabad',
            'destination_lat': 17.4126,
            'destination_lng': 78.4357,
            'max_budget': Decimal('2400.00'),
            'traveller_reward': Decimal('450.00'),
            'required_delivery_date': today + timedelta(days=3),
            'additional_instructions': 'Handle with care. Fragile handicraft.',
            'status': 'OPEN',
            'product_image_url': 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
        }
    )

    # Request 2: Karimnagar -> Hyderabad
    req2, _ = ProductRequest.objects.get_or_create(
        product_name='Karimnagar Silver Filigree Jewelry Box',
        requester=req_user,
        defaults={
            'product_category': 'HANDICRAFTS',
            'product_description': 'Intricate handcrafted silver filigree box from traditional goldsmiths.',
            'product_source': 'PHYSICAL_STORE',
            'pickup_address': 'Tower Circle Market',
            'pickup_city': 'Karimnagar',
            'pickup_lat': 18.4386,
            'pickup_lng': 79.1288,
            'destination_address': 'Jubilee Hills, Check Post',
            'destination_city': 'Hyderabad',
            'destination_lat': 17.4326,
            'destination_lng': 78.4071,
            'max_budget': Decimal('3800.00'),
            'traveller_reward': Decimal('550.00'),
            'required_delivery_date': today + timedelta(days=4),
            'status': 'OPEN',
            'product_image_url': 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
        }
    )

    # Request 3: Mysore -> Bangalore (Already completed delivery)
    req3, _ = ProductRequest.objects.get_or_create(
        product_name='Mysore Pak Traditional Sweets (2kg)',
        requester=req_user,
        defaults={
            'product_category': 'FOOD_SWEETS',
            'product_description': 'Authentic pure ghee Mysore Pak from iconic sweet stall in Mysore.',
            'product_source': 'PHYSICAL_STORE',
            'pickup_address': 'Guru Sweets, Sayyaji Rao Rd',
            'pickup_city': 'Mysore',
            'pickup_lat': 12.3052,
            'pickup_lng': 76.6552,
            'destination_address': 'Koramangala 4th Block',
            'destination_city': 'Bangalore',
            'destination_lat': 12.9352,
            'destination_lng': 77.6245,
            'max_budget': Decimal('950.00'),
            'traveller_reward': Decimal('350.00'),
            'required_delivery_date': today - timedelta(days=2),
            'status': 'DELIVERED',
            'product_image_url': 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'
        }
    )

    # 5. Published Journeys
    now = timezone.now()
    j1, _ = Journey.objects.get_or_create(
        traveller=traveller_user,
        origin_city='Warangal',
        destination_city='Hyderabad',
        defaults={
            'origin_address': 'Kazipet Junction',
            'origin_lat': 17.9784,
            'origin_lng': 79.5255,
            'destination_address': 'Secunderabad Railway Station',
            'destination_lat': 17.4399,
            'destination_lng': 78.5017,
            'intermediate_stops': ['Jangaon', 'Bhongir'],
            'departure_datetime': now + timedelta(days=1, hours=2),
            'estimated_arrival_datetime': now + timedelta(days=1, hours=6),
            'travel_mode': 'TRAIN',
            'carrying_capacity_kg': Decimal('8.00'),
            'additional_notes': 'Travelling by intercity express. Can carry up to 8kg comfortably.',
            'status': 'ACTIVE'
        }
    )

    # Journey 2: Hyderabad to Bangalore
    j2, _ = Journey.objects.get_or_create(
        traveller=traveller_user,
        origin_city='Hyderabad',
        destination_city='Bangalore',
        defaults={
            'origin_address': 'Rajiv Gandhi Intl Airport',
            'origin_lat': 17.2403,
            'origin_lng': 78.4294,
            'destination_address': 'Kempegowda Intl Airport',
            'destination_lat': 13.1986,
            'destination_lng': 77.7066,
            'departure_datetime': now + timedelta(days=5),
            'estimated_arrival_datetime': now + timedelta(days=5, hours=3),
            'travel_mode': 'FLIGHT',
            'carrying_capacity_kg': Decimal('5.00'),
            'status': 'ACTIVE'
        }
    )

    # 6. Completed Delivery Order for Demo (Mysore -> Bangalore)
    del_completed, created_del = DeliveryOrder.objects.get_or_create(
        request=req3,
        defaults={
            'traveller': traveller_user,
            'agreed_reward': Decimal('350.00'),
            'status': 'DELIVERED',
            'current_location_text': 'Delivered to recipient at Koramangala, Bangalore',
            'collected_at': now - timedelta(days=3),
            'in_transit_at': now - timedelta(days=2, hours=10),
            'arrived_at': now - timedelta(days=2, hours=2),
            'delivered_at': now - timedelta(days=2)
        }
    )
    if created_del:
        otp_rec = DeliveryOTP.generate_for_delivery(del_completed)
        otp_rec.is_used = True
        otp_rec.save()

        DeliveryStatusHistory.objects.create(
            delivery=del_completed,
            status='DELIVERED',
            notes='Package handed over and verified with delivery OTP.',
            updated_by=traveller_user
        )

        Payment.objects.create(
            request=req3,
            payer=req_user,
            amount=Decimal('1317.50'),
            platform_fee=Decimal('17.50'),
            traveller_reward=Decimal('350.00'),
            razorpay_order_id='order_demo_mysore_blr',
            razorpay_payment_id='pay_demo_settled_001',
            status='SETTLED'
        )

        TravellerEarning.objects.create(
            traveller=traveller_user,
            delivery=del_completed,
            gross_amount=Decimal('350.00'),
            net_amount=Decimal('350.00'),
            status='AVAILABLE'
        )

        Review.objects.create(
            delivery=del_completed,
            reviewer=req_user,
            reviewee=traveller_user,
            rating=5,
            comment='Excellent traveller! Collected the fresh sweets promptly from Guru Sweets and delivered in perfect condition.'
        )

    # 7. Compute Initial Match between j1 and req1
    eval_res = calculate_route_match(j1, req1)
    if eval_res.get('is_match'):
        RouteMatch.objects.update_or_create(
            journey=j1,
            request=req1,
            defaults={
                'match_score': eval_res['match_score'],
                'detour_distance_km': eval_res['estimated_detour_km'],
                'estimated_travel_time_hours': eval_res['estimated_travel_time_hours'],
                'compatibility_details': eval_res
            }
        )

    # 8. Notifications
    Notification.objects.get_or_create(
        user=req_user,
        title='Welcome to RouteMate!',
        defaults={
            'message': 'Post any product you need from any city. Travellers already commuting along the route will match and deliver.',
            'notification_type': 'SYSTEM',
            'link': '/requester/create-request'
        }
    )

    Notification.objects.get_or_create(
        user=traveller_user,
        title='Route Match Found: Warangal -> Hyderabad',
        defaults={
            'message': 'A requester in Hyderabad needs "Warangal Brass Dhokra Art Lamp" from Warangal. Reward: ₹450.',
            'notification_type': 'MATCH',
            'link': '/traveller/matches'
        }
    )

    print("Demo data seeded successfully!")

if __name__ == '__main__':
    seed()

