from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum
from .models import Journey
from .serializers import JourneySerializer
from apps.accounts.permissions import IsOwnerOrAdmin
from apps.requests_app.models import ProductRequest
from apps.deliveries.models import DeliveryOrder

class JourneyListCreateView(generics.ListCreateAPIView):
    serializer_class = JourneySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['origin_city', 'destination_city', 'travel_mode']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Journey.objects.all()
        mine = self.request.query_params.get('mine')
        if mine and self.request.user.is_authenticated:
            return qs.filter(traveller=self.request.user)

        # Filter by origin/destination
        origin = self.request.query_params.get('origin_city')
        if origin:
            qs = qs.filter(origin_city__icontains=origin)
        dest = self.request.query_params.get('destination_city')
        if dest:
            qs = qs.filter(destination_city__icontains=dest)

        status_val = self.request.query_params.get('status')
        if status_val:
            qs = qs.filter(status=status_val)
        else:
            qs = qs.filter(status='ACTIVE')

        return qs

    def perform_create(self, serializer):
        serializer.save(traveller=self.request.user, status='ACTIVE')

class JourneyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Journey.objects.all()
    serializer_class = JourneySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

class TravellerOverviewStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_journeys = Journey.objects.filter(traveller=user).count()
        available_requests = ProductRequest.objects.filter(status='OPEN').count()
        
        my_deliveries = DeliveryOrder.objects.filter(traveller=user)
        accepted_requests = my_deliveries.filter(status__in=['ACCEPTED', 'COLLECTED', 'IN_TRANSIT', 'ARRIVED']).count()
        active_deliveries = my_deliveries.filter(status__in=['COLLECTED', 'IN_TRANSIT', 'ARRIVED']).count()
        completed_deliveries = my_deliveries.filter(status='DELIVERED').count()

        completed_qs = my_deliveries.filter(status='DELIVERED')
        total_earnings = completed_qs.aggregate(total=Sum('agreed_reward'))['total'] or 0

        return Response({
            'total_journeys': total_journeys,
            'available_requests': available_requests,
            'accepted_requests': accepted_requests,
            'active_deliveries': active_deliveries,
            'completed_deliveries': completed_deliveries,
            'total_earnings': float(total_earnings),
        })

