from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import UserProfile, TravellerVerification
from .serializers import UserProfileSerializer, TravellerVerificationSerializer

class MyProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

class TravellerVerificationView(generics.CreateAPIView, generics.RetrieveAPIView):
    serializer_class = TravellerVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return TravellerVerification.objects.filter(user=self.request.user).first()

    def get(self, request, *args, **kwargs):
        obj = self.get_object()
        if not obj:
            return Response({'status': 'NOT_SUBMITTED'}, status=status.HTTP_200_OK)
        return Response(self.get_serializer(obj).data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='PENDING')

