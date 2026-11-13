from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Avg
from .models import Review
from .serializers import ReviewSerializer
from apps.deliveries.models import DeliveryOrder
from apps.profiles.models import UserProfile

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return Review.objects.filter(reviewee_id=user_id)
        return Review.objects.all()

    def create(self, request, *args, **kwargs):
        delivery_id = request.data.get('delivery')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '').strip()

        if not delivery_id or not rating or not comment:
            return Response({'error': 'Please provide delivery, rating (1-5), and comment.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            delivery = DeliveryOrder.objects.get(id=delivery_id)
        except DeliveryOrder.DoesNotExist:
            return Response({'error': 'Delivery order not found.'}, status=status.HTTP_404_NOT_FOUND)

        if delivery.status != 'DELIVERED':
            return Response({'error': 'Can only review completed deliveries.'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine reviewee: if reviewer is requester, reviewee is traveller, and vice-versa
        user = request.user
        if user == delivery.request.requester:
            reviewee = delivery.traveller
        elif user == delivery.traveller:
            reviewee = delivery.request.requester
        elif user.is_admin():
            reviewee = delivery.traveller
        else:
            return Response({'error': 'You are not a participant in this delivery.'}, status=status.HTTP_403_FORBIDDEN)

        # Check existing review
        if Review.objects.filter(delivery=delivery, reviewer=user).exists():
            return Response({'error': 'You have already reviewed this delivery.'}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(
            delivery=delivery,
            reviewer=user,
            reviewee=reviewee,
            rating=int(rating),
            comment=comment
        )

        # Update average rating of reviewee
        avg_rating = Review.objects.filter(reviewee=reviewee).aggregate(Avg('rating'))['rating__avg']
        if avg_rating:
            profile, _ = UserProfile.objects.get_or_create(user=reviewee)
            profile.average_rating = round(avg_rating, 2)
            profile.save()

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)

