from rest_framework import serializers
from .models import Review
from apps.accounts.serializers import UserSerializer

class ReviewSerializer(serializers.ModelSerializer):
    reviewer = UserSerializer(read_only=True)
    reviewee = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'delivery', 'reviewer', 'reviewee', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer', 'reviewee', 'created_at']

