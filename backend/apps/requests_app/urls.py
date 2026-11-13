from django.urls import path
from .views import ProductRequestListCreateView, ProductRequestDetailView, RequesterOverviewStatsView

urlpatterns = [
    path('', ProductRequestListCreateView.as_view(), name='product_requests_list_create'),
    path('overview/', RequesterOverviewStatsView.as_view(), name='requester_overview_stats'),
    path('<int:pk>/', ProductRequestDetailView.as_view(), name='product_request_detail'),
]

