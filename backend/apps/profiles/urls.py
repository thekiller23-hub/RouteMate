from django.urls import path
from .views import MyProfileView, TravellerVerificationView

urlpatterns = [
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('verification/', TravellerVerificationView.as_view(), name='traveller_verification'),
]

