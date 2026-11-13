from django.urls import path
from .views import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    PaymentHistoryView,
    EarningsDashboardView,
    RequestWithdrawalView
)

urlpatterns = [
    path('create/', CreatePaymentOrderView.as_view(), name='payment_create'),
    path('verify/', VerifyPaymentView.as_view(), name='payment_verify'),
    path('history/', PaymentHistoryView.as_view(), name='payment_history'),
    path('earnings/', EarningsDashboardView.as_view(), name='earnings_dashboard'),
    path('withdraw/', RequestWithdrawalView.as_view(), name='request_withdrawal'),
]

