from rest_framework import serializers
from .models import DeliveryOrder, DeliveryStatusHistory, DeliveryOTP
from apps.requests_app.serializers import ProductRequestSerializer
from apps.accounts.serializers import UserSerializer
from apps.journeys.serializers import JourneySerializer

class DeliveryStatusHistorySerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = DeliveryStatusHistory
        fields = ['id', 'status', 'notes', 'updated_by_name', 'timestamp']

class DeliveryOrderSerializer(serializers.ModelSerializer):
    request = ProductRequestSerializer(read_only=True)
    traveller = UserSerializer(read_only=True)
    journey = JourneySerializer(read_only=True)
    status_history = DeliveryStatusHistorySerializer(many=True, read_only=True)
    requester_otp = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryOrder
        fields = [
            'id', 'request', 'traveller', 'journey', 'tracking_code',
            'agreed_reward', 'status', 'current_location_text',
            'current_lat', 'current_lng', 'collected_at', 'in_transit_at',
            'arrived_at', 'delivered_at', 'status_history', 'requester_otp',
            'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_requester_otp(self, obj):
        # SECURITY: Strictly only reveal the OTP to the requester of this order!
        request_user = self.context.get('request').user if self.context.get('request') else None
        if not request_user or not request_user.is_authenticated:
            return None

        # Admin or Requester of this specific request
        if request_user == obj.request.requester or request_user.is_admin():
            otp_record = getattr(obj, 'otp_record', None)
            if otp_record and not otp_record.is_used and otp_record.is_valid():
                return otp_record.otp_code
        return None

