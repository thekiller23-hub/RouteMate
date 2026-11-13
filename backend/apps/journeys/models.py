from django.db import models
from django.conf import settings

class Journey(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active & Accepting Requests'),
        ('IN_TRANSIT', 'Journey Underway'),
        ('COMPLETED', 'Journey Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    TRAVEL_MODES = (
        ('TRAIN', 'Train'),
        ('FLIGHT', 'Flight'),
        ('CAR', 'Personal Car / Taxi'),
        ('BUS', 'Intercity Bus'),
        ('BIKE', 'Motorcycle'),
        ('OTHER', 'Other'),
    )

    traveller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='journeys')
    
    # Origin
    origin_city = models.CharField(max_length=100)
    origin_address = models.CharField(max_length=255, blank=True, default='')
    origin_lat = models.FloatField(null=True, blank=True)
    origin_lng = models.FloatField(null=True, blank=True)

    # Destination
    destination_city = models.CharField(max_length=100)
    destination_address = models.CharField(max_length=255, blank=True, default='')
    destination_lat = models.FloatField(null=True, blank=True)
    destination_lng = models.FloatField(null=True, blank=True)

    # Intermediate Stops (Array of city names or stop dicts: [{"city": "Siddipet", "order": 1}])
    intermediate_stops = models.JSONField(default=list, blank=True)

    # Schedule
    departure_datetime = models.DateTimeField()
    estimated_arrival_datetime = models.DateTimeField()

    # Logistics
    travel_mode = models.CharField(max_length=20, choices=TRAVEL_MODES, default='TRAIN')
    carrying_capacity_kg = models.DecimalField(max_digits=5, decimal_places=2, default=5.00, help_text="Carrying capacity in Kilograms")
    additional_notes = models.TextField(blank=True, default='')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['departure_datetime']
        indexes = [
            models.Index(fields=['origin_city', 'destination_city']),
            models.Index(fields=['status']),
            models.Index(fields=['departure_datetime']),
        ]

    def __str__(self):
        return f"{self.traveller.username}: {self.origin_city} -> {self.destination_city} ({self.departure_datetime.strftime('%Y-%m-%d %H:%M')})"

