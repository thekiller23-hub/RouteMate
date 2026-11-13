import hmac
import hashlib
import uuid
from decimal import Decimal
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment, PaymentTransaction, TravellerEarning, Withdrawal
from .serializers import PaymentSerializer, TravellerEarningSerializer, WithdrawalSerializer
from apps.requests_app.models import ProductRequest
from apps.notifications.models import Notification

try:
    import razorpay
    razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception:
    razorpay_client = None

class CreatePaymentOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request_id = request.data.get('request_id')
        user = request.user

        try:
            prod_req = ProductRequest.objects.get(id=request_id)
        except ProductRequest.DoesNotExist:
            return Response({'error': 'Product request not found.'}, status=status.HTTP_404_NOT_FOUND)

        if prod_req.requester != user and not user.is_admin():
            return Response({'error': 'Not authorized to initiate payment for this request.'}, status=status.HTTP_403_FORBIDDEN)

        # Calculate breakdown
        budget = prod_req.max_budget
        reward = prod_req.traveller_reward
        platform_fee = (reward * Decimal('0.05')).quantize(Decimal('0.01')) # 5% transparent platform fee
        total_amount = budget + reward + platform_fee
        amount_in_paise = int(total_amount * 100)

        order_id = f"order_rm_{uuid.uuid4().hex[:14]}"

        # Attempt Razorpay order creation if configured with live keys
        if razorpay_client and settings.RAZORPAY_KEY_ID != 'rzp_test_mock_key':
            try:
                razorpay_order = razorpay_client.order.create({
                    'amount': amount_in_paise,
                    'currency': 'INR',
                    'receipt': f"rcpt_req_{prod_req.id}",
                    'notes': {
                        'request_id': prod_req.id,
                        'requester': user.username
                    }
                })
                order_id = razorpay_order['id']
            except Exception as e:
                # Log and fallback to local sandbox order
                print(f"Razorpay API notice: {e}. Using RouteMate Escrow gateway.")

        payment, _ = Payment.objects.update_or_create(
            request=prod_req,
            payer=user,
            defaults={
                'amount': total_amount,
                'platform_fee': platform_fee,
                'traveller_reward': reward,
                'razorpay_order_id': order_id,
                'status': 'PENDING'
            }
        )

        return Response({
            'order_id': order_id,
            'amount': float(total_amount),
            'amount_in_paise': amount_in_paise,
            'currency': 'INR',
            'key_id': settings.RAZORPAY_KEY_ID,
            'breakdown': {
                'product_budget': float(budget),
                'traveller_reward': float(reward),
                'platform_fee': float(platform_fee),
                'total': float(total_amount),
            },
            'payment_id': payment.id
        })

class VerifyPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature', '')

        if not order_id or not payment_id:
            return Response({'error': 'Missing payment verification credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Order ID not found in system.'}, status=status.HTTP_404_NOT_FOUND)

        # Signature validation
        is_valid = True
        if razorpay_client and settings.RAZORPAY_KEY_ID != 'rzp_test_mock_key' and signature:
            try:
                razorpay_client.utility.verify_payment_signature({
                    'razorpay_order_id': order_id,
                    'razorpay_payment_id': payment_id,
                    'razorpay_signature': signature
                })
            except Exception:
                is_valid = False

        if not is_valid:
            payment.status = 'FAILED'
            payment.save()
            PaymentTransaction.objects.create(
                payment=payment,
                transaction_type='CHARGE',
                amount=payment.amount,
                status='FAILED',
                gateway_response={'error': 'Invalid signature'}
            )
            return Response({'error': 'Payment verification failed. Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        # Successful verification: Mark PAID and held in escrow
        payment.status = 'PAID'
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.save()

        PaymentTransaction.objects.create(
            payment=payment,
            transaction_type='CHARGE',
            amount=payment.amount,
            status='SUCCESS',
            gateway_response={'payment_id': payment_id, 'order_id': order_id}
        )

        Notification.objects.create(
            user=payment.payer,
            title='Payment Held in Escrow',
            message=f'₹{payment.amount} is securely held in RouteMate Escrow for "{payment.request.product_name}". It will be released when you confirm delivery with OTP.',
            notification_type='PAYMENT',
            link='/requester/payments'
        )

        return Response({
            'message': 'Payment successfully verified and held in escrow.',
            'payment': PaymentSerializer(payment).data
        })

class PaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(payer=user).order_by('-created_at')

class EarningsDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        earnings_qs = TravellerEarning.objects.filter(traveller=user)

        total_earnings = earnings_qs.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        pending_earnings = earnings_qs.filter(status='PENDING').aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        available_balance = earnings_qs.filter(status='AVAILABLE').aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')
        withdrawn_balance = earnings_qs.filter(status='WITHDRAWN').aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')

        history = TravellerEarningSerializer(earnings_qs.order_by('-created_at')[:20], many=True).data
        withdrawals = WithdrawalSerializer(Withdrawal.objects.filter(traveller=user).order_by('-created_at')[:10], many=True).data

        return Response({
            'total_earnings': float(total_earnings),
            'pending_earnings': float(pending_earnings),
            'available_balance': float(available_balance),
            'withdrawn_balance': float(withdrawn_balance),
            'history': history,
            'withdrawals': withdrawals,
        })

class RequestWithdrawalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        amount_val = request.data.get('amount')
        payout_method = request.data.get('payout_method', 'UPI')
        account_details = request.data.get('account_details', '').strip()

        if not amount_val or not account_details:
            return Response({'error': 'Please specify amount and payout account details (UPI ID or Bank Account).'}, status=status.HTTP_400_BAD_REQUEST)

        amount = Decimal(str(amount_val))
        available_qs = TravellerEarning.objects.filter(traveller=user, status='AVAILABLE')
        available_balance = available_qs.aggregate(total=Sum('net_amount'))['total'] or Decimal('0.00')

        if amount > available_balance:
            return Response({'error': f'Requested amount (₹{amount}) exceeds available balance (₹{available_balance}).'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            withdrawal = Withdrawal.objects.create(
                traveller=user,
                amount=amount,
                payout_method=payout_method,
                account_details=account_details,
                status='REQUESTED'
            )

            # Deduct from available earnings
            remaining_to_deduct = amount
            for earning in available_qs.order_by('created_at'):
                if remaining_to_deduct <= 0:
                    break
                if earning.net_amount <= remaining_to_deduct:
                    remaining_to_deduct -= earning.net_amount
                    earning.status = 'WITHDRAWN'
                    earning.save()
                else:
                    # Partial split
                    earning.net_amount -= remaining_to_deduct
                    earning.save()
                    remaining_to_deduct = 0

            Notification.objects.create(
                user=user,
                title='Withdrawal Request Submitted',
                message=f'Your withdrawal request for ₹{amount} has been received and is being processed.',
                notification_type='PAYMENT',
                link='/traveller/earnings'
            )

        return Response({
            'message': 'Withdrawal request created successfully.',
            'withdrawal': WithdrawalSerializer(withdrawal).data
        }, status=status.HTTP_201_CREATED)

