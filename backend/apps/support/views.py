from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Complaint, UserReport, AdminAuditLog
from .serializers import ComplaintSerializer, UserReportSerializer, AdminAuditLogSerializer

class ComplaintListCreateView(generics.ListCreateAPIView):
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin():
            return Complaint.objects.all().order_by('-created_at')
        return Complaint.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserReportCreateView(generics.CreateAPIView):
    serializer_class = UserReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

