from django.urls import path
from .views import ComplaintListCreateView, UserReportCreateView

urlpatterns = [
    path('complaints/', ComplaintListCreateView.as_view(), name='complaints'),
    path('reports/', UserReportCreateView.as_view(), name='reports'),
]

