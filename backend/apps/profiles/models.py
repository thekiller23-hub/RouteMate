from django.db import models
from django.conf import settings

class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    state = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.00)
    completed_deliveries_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

class TravellerVerification(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )

    DOC_TYPES = (
        ('AADHAAR', 'Aadhaar / National ID'),
        ('DRIVING_LICENSE', 'Driving License'),
        ('PASSPORT', 'Passport'),
        ('VOTER_ID', 'Voter ID'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='traveller_verification')
    document_type = models.CharField(max_length=30, choices=DOC_TYPES, default='AADHAAR')
    id_number = models.CharField(max_length=100)
    document_image = models.ImageField(upload_to='verifications/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.user.username} - {self.status}"

