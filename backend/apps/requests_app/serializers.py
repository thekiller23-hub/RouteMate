from rest_framework import serializers
from .models import ProductRequest
from apps.accounts.serializers import UserSerializer

class ProductRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = ProductRequest
        fields = [
            'id', 'requester', 'product_name', 'product_category',
            'product_description', 'product_image', 'product_image_url',
            'quantity', 'product_source', 'pickup_address', 'pickup_city',
            'pickup_lat', 'pickup_lng', 'destination_address', 'destination_city',
            'destination_lat', 'destination_lng', 'max_budget', 'traveller_reward',
            'required_delivery_date', 'additional_instructions', 'status',
            'is_editable', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requester', 'status', 'created_at', 'updated_at', 'is_editable']

    def get_is_editable(self, obj):
        return obj.status in ['OPEN', 'MATCHED']

