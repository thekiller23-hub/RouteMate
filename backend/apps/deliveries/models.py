import uuid
import secrets
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

class DeliveryOrder(models.Model):
    STATUS_CHOICES = (
        ('ACCEPTED', 'Accepted by Traveller'),
        ('COLLECTED', 'Product Collected'),
        ('IN_TRANSIT', 'In Transit'),
        ('ARRIVED', 'Arrived at Destination City'),
        ('READY_FOR_HANDOVER', 'Ready for Handover'),
        ('DELIVERED', 'Delivered & Confirmed via OTP'),
        ('CANCELLED', 'Cancelled'),
    )

    request = models.OneToOneField('requests_app.ProductRequest', on_delete=models.CASCADE, related_name='delivery_order')
    traveller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='deliveries_as_traveller')
    journey = models.ForeignKey('journeys.Journey', on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    
    tracking_code = models.CharField(max_length=32, unique=True, editable=False)
    agreed_reward = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ACCEPTED')

    # Real-time Location Tracking
    current_location_text = models.CharField(max_length=255, blank=True, default='')
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)

    # Timestamps for stages
    collected_at = models.DateTimeField(null=True, blank=True)
    in_transit_at = models.DateTimeField(null=True, blank=True)
    arrived_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            self.tracking_code = f"RM-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tracking_code} - {self.request.product_name} ({self.status})"

class DeliveryStatusHistory(models.Model):
    delivery = models.ForeignKey(DeliveryOrder, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30)
    notes = models.TextField(blank=True, default='')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.delivery.tracking_code} -> {self.status} at {self.timestamp}"

class DeliveryOTP(models.Model):
    delivery = models.OneToOneField(DeliveryOrder, on_delete=models.CASCADE, related_name='otp_record')
    otp_code = models.CharField(max_length=6)
    attempts = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=5)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_for_delivery(cls, delivery):
        code = f"{secrets.randbelow(900000) + 100000}"  # 6-digit random code
        expires = timezone.now() + timedelta(hours=6)
        obj, _ = cls.objects.update_or_create(
            delivery=delivery,
            defaults={
                'otp_code': code,
                'attempts': 0,
                'max_attempts': 5,
                'expires_at': expires,
                'is_used': False
            }
        )
        return obj

    def is_valid(self):
        return (not self.is_used) and (self.attempts < self.max_attempts) and (timezone.now() <= self.expires_at)

