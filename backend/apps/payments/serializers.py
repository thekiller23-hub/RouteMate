from rest_framework import serializers
from .models import Payment, PaymentTransaction, TravellerEarning, Withdrawal
from apps.requests_app.serializers import ProductRequestSerializer

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'transaction_type', 'amount', 'status', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    request = ProductRequestSerializer(read_only=True)
    transactions = PaymentTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'request', 'amount', 'platform_fee', 'traveller_reward',
            'razorpay_order_id', 'razorpay_payment_id', 'status',
            'transactions', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

class TravellerEarningSerializer(serializers.ModelSerializer):
    delivery_code = serializers.CharField(source='delivery.tracking_code', read_only=True)
    product_name = serializers.CharField(source='delivery.request.product_name', read_only=True)

    class Meta:
        model = TravellerEarning
        fields = [
            'id', 'delivery_code', 'product_name', 'gross_amount',
            'net_amount', 'status', 'created_at'
        ]

class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = [
            'id', 'amount', 'payout_method', 'account_details',
            'status', 'reference_id', 'notes', 'created_at', 'processed_at'
        ]
        read_only_fields = ['id', 'status', 'reference_id', 'created_at', 'processed_at']

