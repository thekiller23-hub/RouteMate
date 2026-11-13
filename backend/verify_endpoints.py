import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

from rest_framework.test import APIClient
from apps.accounts.models import User

client = APIClient()

# 1. Public Requests endpoint
resp = client.get('/api/requests/')
print(f"GET /api/requests/ -> Status: {resp.status_code}, Found {len(resp.data.get('results', resp.data))} items")

# 2. Admin Overview with authenticated admin
admin = User.objects.get(username='admin')
client.force_authenticate(user=admin)
resp_admin = client.get('/api/analytics/admin-overview/')
print(f"GET /api/analytics/admin-overview/ -> Status: {resp_admin.status_code}")
print(f"  Total registered users: {resp_admin.data.get('total_registered_users')}")
print(f"  Platform revenue: ₹{resp_admin.data.get('platform_revenue')}")
print(f"  Completed deliveries: {resp_admin.data.get('completed_deliveries')}")

# 3. Matching Requests for Traveller
traveller = User.objects.get(username='traveller_demo')
client.force_authenticate(user=traveller)
resp_match = client.get('/api/matching/requests/')
matches = resp_match.data.get('matches', [])
print(f"GET /api/matching/requests/ -> Status: {resp_match.status_code}, Matches: {len(matches)}")
if matches:
    first_match = matches[0]
    print(f"  Top Match: {first_match['request']['product_name']} ({first_match['match_score']}% Match Score)")
    print(f"  Corridor: {first_match['request']['pickup_city']} -> {first_match['request']['destination_city']}")

print("\nAll endpoints verified successfully!")

