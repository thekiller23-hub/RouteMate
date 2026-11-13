from rest_framework import serializers
from .models import Journey
from apps.accounts.serializers import UserSerializer

class JourneySerializer(serializers.ModelSerializer):
    traveller = UserSerializer(read_only=True)
    traveller_rating = serializers.SerializerMethodField()
    traveller_is_verified = serializers.SerializerMethodField()

    class Meta:
        model = Journey
        fields = [
            'id', 'traveller', 'origin_city', 'origin_address',
            'origin_lat', 'origin_lng', 'destination_city',
            'destination_address', 'destination_lat', 'destination_lng',
            'intermediate_stops', 'departure_datetime', 'estimated_arrival_datetime',
            'travel_mode', 'carrying_capacity_kg', 'additional_notes',
            'status', 'traveller_rating', 'traveller_is_verified',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'traveller', 'created_at', 'updated_at']

    def get_traveller_rating(self, obj):
        profile = getattr(obj.traveller, 'profile', None)
        return float(profile.average_rating) if profile else 5.0

    def get_traveller_is_verified(self, obj):
        return obj.traveller.is_identity_verified

