from django.urls import path
from .views import (
    AcceptRequestView,
    DeliveryListView,
    DeliveryDetailView,
    UpdateDeliveryStatusView,
    ConfirmDeliveryOTPView
)

urlpatterns = [
    path('', DeliveryListView.as_view(), name='delivery_list'),
    path('<int:pk>/', DeliveryDetailView.as_view(), name='delivery_detail'),
    path('<int:pk>/status/', UpdateDeliveryStatusView.as_view(), name='update_delivery_status'),
    path('<int:pk>/confirm-otp/', ConfirmDeliveryOTPView.as_view(), name='confirm_delivery_otp'),
    path('accept/<int:request_id>/', AcceptRequestView.as_view(), name='accept_request'),
]

