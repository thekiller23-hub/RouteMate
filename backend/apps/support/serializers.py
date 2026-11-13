from rest_framework import serializers
from .models import Complaint, UserReport, AdminAuditLog
from apps.accounts.serializers import UserSerializer

class ComplaintSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Complaint
        fields = ['id', 'user', 'delivery', 'subject', 'description', 'status', 'admin_response', 'created_at', 'resolved_at']
        read_only_fields = ['id', 'user', 'status', 'admin_response', 'created_at', 'resolved_at']

class UserReportSerializer(serializers.ModelSerializer):
    reported_by = UserSerializer(read_only=True)
    reported_user = UserSerializer(read_only=True)

    class Meta:
        model = UserReport
        fields = ['id', 'reported_by', 'reported_user', 'reason', 'details', 'status', 'created_at']
        read_only_fields = ['id', 'reported_by', 'status', 'created_at']

class AdminAuditLogSerializer(serializers.ModelSerializer):
    admin_name = serializers.CharField(source='admin.username', read_only=True)

    class Meta:
        model = AdminAuditLog
        fields = ['id', 'admin_name', 'action', 'target_model', 'target_id', 'details', 'timestamp']

