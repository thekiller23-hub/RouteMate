from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.accounts.models import User
from apps.accounts.serializers import UserSerializer
from apps.accounts.permissions import IsAdminRole
from apps.requests_app.models import ProductRequest
from apps.journeys.models import Journey
from apps.deliveries.models import DeliveryOrder
from apps.payments.models import Payment
from apps.support.models import Complaint, AdminAuditLog

class AdminOverviewStatsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        total_users = User.objects.count()
        total_requesters = User.objects.filter(role='REQUESTER').count()
        total_travellers = User.objects.filter(role='TRAVELLER').count()
        verified_travellers = User.objects.filter(role='TRAVELLER', is_identity_verified=True).count()

        total_requests = ProductRequest.objects.count()
        open_requests = ProductRequest.objects.filter(status='OPEN').count()
        active_deliveries = DeliveryOrder.objects.filter(status__in=['ACCEPTED', 'COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'READY_FOR_HANDOVER']).count()
        completed_deliveries = DeliveryOrder.objects.filter(status='DELIVERED').count()

        # Platform revenue from settled/paid payments
        platform_revenue = Payment.objects.filter(status__in=['PAID', 'SETTLED']).aggregate(total=Sum('platform_fee'))['total'] or Decimal('0.00')
        pending_complaints = Complaint.objects.filter(status='PENDING').count()

        return Response({
            'total_registered_users': total_users,
            'total_requesters': total_requesters,
            'total_travellers': total_travellers,
            'verified_travellers': verified_travellers,
            'total_requests': total_requests,
            'open_requests': open_requests,
            'active_deliveries': active_deliveries,
            'completed_deliveries': completed_deliveries,
            'platform_revenue': float(platform_revenue),
            'pending_complaints': pending_complaints,
        })

class AdminUsersListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        qs = User.objects.all().order_by('-date_joined')
        role = request.query_params.get('role')
        if role:
            qs = qs.filter(role=role)
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(Q(username__icontains=search) | Q(email__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search))

        users_data = []
        for u in qs:
            data = UserSerializer(u).data
            data['is_active'] = u.is_active
            data['date_joined'] = u.date_joined
            users_data.append(data)

        return Response({'users': users_data, 'total': len(users_data)})

class AdminUserActionView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'toggle_suspend', 'verify', 'unverify'
        admin = request.user

        if action == 'toggle_suspend':
            target_user.is_active = not target_user.is_active
            target_user.save()
            action_desc = "Reactivated" if target_user.is_active else "Suspended"
            AdminAuditLog.objects.create(
                admin=admin,
                action=f"{action_desc} User",
                target_model='User',
                target_id=str(target_user.id),
                details=f"Admin {admin.username} set is_active={target_user.is_active} for {target_user.username}"
            )
            return Response({'message': f'User {target_user.username} has been {action_desc.lower()}.', 'is_active': target_user.is_active})

        elif action == 'verify':
            target_user.is_identity_verified = True
            target_user.save()
            AdminAuditLog.objects.create(
                admin=admin,
                action="Verified Traveller",
                target_model='User',
                target_id=str(target_user.id),
                details=f"Admin {admin.username} verified identity for {target_user.username}"
            )
            return Response({'message': f'User {target_user.username} marked as verified.', 'is_identity_verified': True})

        return Response({'error': f'Unknown action: {action}'}, status=status.HTTP_400_BAD_REQUEST)

class AdminAnalyticsChartsView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        # Category breakdown
        category_counts = ProductRequest.objects.values('product_category').annotate(count=Count('id')).order_by('-count')
        
        # Route frequency
        route_pairs = ProductRequest.objects.values('pickup_city', 'destination_city').annotate(count=Count('id')).order_by('-count')[:5]

        # Monthly registration trends (last 6 months)
        now = timezone.now()
        monthly_trends = []
        for i in range(5, -1, -1):
            month_date = now - timedelta(days=i * 30)
            month_name = month_date.strftime('%b %Y')
            month_count = User.objects.filter(date_joined__year=month_date.year, date_joined__month=month_date.month).count()
            monthly_trends.append({'month': month_name, 'registrations': month_count})

        # Delivery completion rate
        total_d = DeliveryOrder.objects.count()
        completed_d = DeliveryOrder.objects.filter(status='DELIVERED').count()
        completion_rate = round((completed_d / total_d * 100), 1) if total_d > 0 else 100.0

        return Response({
            'category_breakdown': list(category_counts),
            'top_routes': list(route_pairs),
            'monthly_trends': monthly_trends,
            'completion_rate': completion_rate,
            'total_deliveries': total_d,
            'completed_deliveries': completed_d
        })

