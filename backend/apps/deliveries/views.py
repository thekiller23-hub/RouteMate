from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, models
from django.utils import timezone
from .models import DeliveryOrder, DeliveryStatusHistory, DeliveryOTP
from .serializers import DeliveryOrderSerializer
from apps.requests_app.models import ProductRequest
from apps.journeys.models import Journey
from apps.notifications.models import Notification
from apps.payments.models import TravellerEarning

class AcceptRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, request_id):
        journey_id = request.data.get('journey_id')
        user = request.user

        if user.role != 'TRAVELLER' and not user.is_admin():
            return Response({'error': 'Only registered travellers can accept delivery requests.'}, status=status.HTTP_403_FORBIDDEN)

        # Atomic transaction to guarantee no two travellers accept the same request simultaneously
        with transaction.atomic():
            try:
                prod_req = ProductRequest.objects.select_for_update().get(id=request_id)
            except ProductRequest.DoesNotExist:
                return Response({'error': 'Product request not found.'}, status=status.HTTP_404_NOT_FOUND)

            if prod_req.status not in ['OPEN', 'MATCHED']:
                return Response({'error': f'Request is no longer available (current status: {prod_req.status}).'}, status=status.HTTP_400_BAD_REQUEST)

            if prod_req.requester == user:
                return Response({'error': 'You cannot accept your own product request.'}, status=status.HTTP_400_BAD_REQUEST)

            journey = None
            if journey_id:
                journey = Journey.objects.filter(id=journey_id, traveller=user).first()

            # Mark request as accepted
            prod_req.status = 'ACCEPTED'
            prod_req.save()

            # Create delivery order
            delivery = DeliveryOrder.objects.create(
                request=prod_req,
                traveller=user,
                journey=journey,
                agreed_reward=prod_req.traveller_reward,
                status='ACCEPTED'
            )

            # Generate OTP for requester
            DeliveryOTP.generate_for_delivery(delivery)

            # Record history
            DeliveryStatusHistory.objects.create(
                delivery=delivery,
                status='ACCEPTED',
                notes='Traveller accepted the delivery request.',
                updated_by=user
            )

            # Notify requester
            Notification.objects.create(
                user=prod_req.requester,
                title='Traveller Accepted Your Request!',
                message=f'{user.username} has agreed to deliver "{prod_req.product_name}" from {prod_req.pickup_city} to {prod_req.destination_city}.',
                notification_type='MATCH',
                link=f'/requester/deliveries/{delivery.id}'
            )

        serializer = DeliveryOrderSerializer(delivery, context={'request': request})
        return Response({
            'message': 'Request accepted successfully. Delivery order created.',
            'delivery': serializer.data
        }, status=status.HTTP_201_CREATED)

class DeliveryListView(generics.ListAPIView):
    serializer_class = DeliveryOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            qs = DeliveryOrder.objects.all()
        elif user.role == 'TRAVELLER':
            qs = DeliveryOrder.objects.filter(traveller=user)
        else:
            qs = DeliveryOrder.objects.filter(request__requester=user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.order_by('-created_at')

class DeliveryDetailView(generics.RetrieveAPIView):
    serializer_class = DeliveryOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return DeliveryOrder.objects.all()
        return DeliveryOrder.objects.filter(models.Q(traveller=user) | models.Q(request__requester=user))

class UpdateDeliveryStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        try:
            delivery = DeliveryOrder.objects.get(pk=pk)
        except DeliveryOrder.DoesNotExist:
            return Response({'error': 'Delivery not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.traveller != user and not user.is_admin():
            return Response({'error': 'Only the assigned traveller or admin can update delivery status.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        location_text = request.data.get('location_text', '')
        lat = request.data.get('lat')
        lng = request.data.get('lng')

        valid_transitions = ['COLLECTED', 'IN_TRANSIT', 'ARRIVED', 'READY_FOR_HANDOVER']
        if new_status not in valid_transitions:
            return Response({'error': f'Invalid status transition: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()
        delivery.status = new_status
        if location_text:
            delivery.current_location_text = location_text
        if lat:
            delivery.current_lat = lat
        if lng:
            delivery.current_lng = lng

        if new_status == 'COLLECTED':
            delivery.collected_at = now
            delivery.request.status = 'COLLECTED'
        elif new_status == 'IN_TRANSIT':
            delivery.in_transit_at = now
            delivery.request.status = 'IN_TRANSIT'
        elif new_status == 'ARRIVED':
            delivery.arrived_at = now
            delivery.request.status = 'ARRIVED'
        elif new_status == 'READY_FOR_HANDOVER':
            # Regenerate or refresh OTP if needed
            DeliveryOTP.generate_for_delivery(delivery)

        delivery.request.save()
        delivery.save()

        DeliveryStatusHistory.objects.create(
            delivery=delivery,
            status=new_status,
            notes=notes or f"Status updated to {new_status}",
            updated_by=user
        )

        # Notify requester
        Notification.objects.create(
            user=delivery.request.requester,
            title=f'Delivery Update: {new_status.replace("_", " ").title()}',
            message=f'Your item "{delivery.request.product_name}" is now {new_status.replace("_", " ").lower()}. {notes}',
            notification_type='STATUS',
            link=f'/requester/deliveries/{delivery.id}'
        )

        serializer = DeliveryOrderSerializer(delivery, context={'request': request})
        return Response({
            'message': f'Status updated to {new_status}',
            'delivery': serializer.data
        })

class ConfirmDeliveryOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        otp_input = request.data.get('otp_code', '').strip()

        if not otp_input:
            return Response({'error': 'Please provide the 6-digit OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            try:
                delivery = DeliveryOrder.objects.select_for_update().get(pk=pk)
            except DeliveryOrder.DoesNotExist:
                return Response({'error': 'Delivery order not found.'}, status=status.HTTP_404_NOT_FOUND)

            # Check if user is either the traveller confirming with the customer's code, or admin
            if delivery.traveller != user and delivery.request.requester != user and not user.is_admin():
                return Response({'error': 'Not authorized to verify this delivery.'}, status=status.HTTP_403_FORBIDDEN)

            try:
                otp_record = DeliveryOTP.objects.select_for_update().get(delivery=delivery)
            except DeliveryOTP.DoesNotExist:
                return Response({'error': 'No OTP generated for this delivery.'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.is_used:
                return Response({'error': 'This delivery has already been verified.'}, status=status.HTTP_400_BAD_REQUEST)

            if timezone.now() > otp_record.expires_at:
                return Response({'error': 'OTP has expired. Please request a new delivery handover code.'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.attempts >= otp_record.max_attempts:
                return Response({'error': 'Maximum OTP verification attempts exceeded. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

            if otp_record.otp_code != otp_input:
                otp_record.attempts += 1
                otp_record.save()
                remaining = otp_record.max_attempts - otp_record.attempts
                return Response({
                    'error': f'Incorrect OTP. {remaining} attempt(s) remaining.'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Success: Valid OTP!
            otp_record.is_used = True
            otp_record.save()

            now = timezone.now()
            delivery.status = 'DELIVERED'
            delivery.delivered_at = now
            delivery.save()

            delivery.request.status = 'DELIVERED'
            delivery.request.save()

            DeliveryStatusHistory.objects.create(
                delivery=delivery,
                status='DELIVERED',
                notes='Delivery successfully verified via customer OTP confirmation.',
                updated_by=user
            )

            # Credit traveller earnings
            TravellerEarning.objects.create(
                traveller=delivery.traveller,
                delivery=delivery,
                gross_amount=delivery.agreed_reward,
                net_amount=delivery.agreed_reward, # Platform fee handled on requester side
                status='AVAILABLE'
            )

            # Notify both parties
            Notification.objects.create(
                user=delivery.request.requester,
                title='Delivery Completed!',
                message=f'Your order "{delivery.request.product_name}" has been successfully delivered and confirmed.',
                notification_type='DELIVERY',
                link=f'/requester/deliveries/{delivery.id}'
            )

            Notification.objects.create(
                user=delivery.traveller,
                title='Reward Credited!',
                message=f'You have completed the delivery for "{delivery.request.product_name}". ₹{delivery.agreed_reward} is now available in your earnings!',
                notification_type='PAYMENT',
                link='/traveller/earnings'
            )

        serializer = DeliveryOrderSerializer(delivery, context={'request': request})
        return Response({
            'message': 'Delivery confirmed successfully! Reward has been settled.',
            'delivery': serializer.data
        })
