from django.urls import path
from .views import JourneyListCreateView, JourneyDetailView, TravellerOverviewStatsView

urlpatterns = [
    path('', JourneyListCreateView.as_view(), name='journey_list_create'),
    path('overview/', TravellerOverviewStatsView.as_view(), name='traveller_overview_stats'),
    path('<int:pk>/', JourneyDetailView.as_view(), name='journey_detail'),
]

