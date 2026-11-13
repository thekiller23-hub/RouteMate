from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Q
from .models import ProductRequest
from .serializers import ProductRequestSerializer
from apps.accounts.permissions import IsOwnerOrAdmin

class ProductRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductRequestSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['product_name', 'pickup_city', 'destination_city', 'product_category']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = ProductRequest.objects.all()
        # Filter for requester's own requests
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            return qs.filter(requester=self.request.user)

        # Filter by status
        req_status = self.request.query_params.get('status')
        if req_status:
            qs = qs.filter(status=req_status)

        # Filter by pickup/destination city
        pickup = self.request.query_params.get('pickup_city')
        if pickup:
            qs = qs.filter(pickup_city__icontains=pickup)
        dest = self.request.query_params.get('destination_city')
        if dest:
            qs = qs.filter(destination_city__icontains=dest)

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(product_category=category)

        return qs

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user, status='OPEN')

class ProductRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductRequest.objects.all()
    serializer_class = ProductRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status not in ['OPEN', 'MATCHED'] and not self.request.user.is_admin():
            raise serializers.ValidationError("Cannot edit a request that is already accepted or in transit.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.status not in ['OPEN', 'MATCHED'] and not self.request.user.is_admin():
            raise serializers.ValidationError("Cannot delete a request that is already accepted or in transit.")
        instance.status = 'CANCELLED'
        instance.save()

class RequesterOverviewStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = ProductRequest.objects.filter(requester=user)
        total_requests = qs.count()
        active_requests = qs.filter(status__in=['OPEN', 'MATCHED']).count()
        matched_requests = qs.filter(status='MATCHED').count()
        accepted_requests = qs.filter(status='ACCEPTED').count()
        completed_deliveries = qs.filter(status='DELIVERED').count()
        
        # Calculate total spending from completed deliveries
        completed_qs = qs.filter(status='DELIVERED')
        total_spending = completed_qs.aggregate(
            total=(Sum('max_budget') + Sum('traveller_reward'))
        )['total'] or 0

        return Response({
            'total_requests': total_requests,
            'active_requests': active_requests,
            'matched_requests': matched_requests,
            'accepted_requests': accepted_requests,
            'completed_deliveries': completed_deliveries,
            'total_spending': float(total_spending),
        })

