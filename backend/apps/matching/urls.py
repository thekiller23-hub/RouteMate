from django.urls import path
from .views import MatchingRequestsForTravellerView, MatchingTravellersForRequesterView

urlpatterns = [
    path('requests/', MatchingRequestsForTravellerView.as_view(), name='matching_requests'),
    path('travellers/', MatchingTravellersForRequesterView.as_view(), name='matching_travellers'),
]

