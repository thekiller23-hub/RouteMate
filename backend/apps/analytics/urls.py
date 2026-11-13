from django.urls import path
from .views import AdminOverviewStatsView, AdminUsersListView, AdminUserActionView, AdminAnalyticsChartsView

urlpatterns = [
    path('admin-overview/', AdminOverviewStatsView.as_view(), name='admin_overview_stats'),
    path('admin-users/', AdminUsersListView.as_view(), name='admin_users_list'),
    path('admin-users/<int:user_id>/action/', AdminUserActionView.as_view(), name='admin_user_action'),
    path('charts/', AdminAnalyticsChartsView.as_view(), name='admin_analytics_charts'),
]

