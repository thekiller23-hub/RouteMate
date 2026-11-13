from rest_framework import serializers
from .models import UserProfile, TravellerVerification
from apps.accounts.serializers import UserSerializer

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'avatar', 'bio', 'address', 'city',
            'state', 'postal_code', 'average_rating',
            'completed_deliveries_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'average_rating', 'completed_deliveries_count', 'created_at', 'updated_at']

class TravellerVerificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TravellerVerification
        fields = [
            'id', 'user', 'document_type', 'id_number', 'document_image',
            'status', 'submitted_at', 'reviewed_at', 'reviewer_notes'
        ]
        read_only_fields = ['id', 'status', 'submitted_at', 'reviewed_at', 'reviewer_notes']

