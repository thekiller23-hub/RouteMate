from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('REQUESTER', 'Requester'),
        ('TRAVELLER', 'Traveller'),
        ('ADMIN', 'Administrator'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='REQUESTER')
    phone_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    is_phone_verified = models.BooleanField(default=False)
    is_identity_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin(self):
        return self.role == 'ADMIN' or self.is_superuser or self.is_staff

    def is_requester(self):
        return self.role == 'REQUESTER'

    def is_traveller(self):
        return self.role == 'TRAVELLER'

    def __str__(self):
        return f"{self.username} ({self.role})"

