from django.db import models

class RouteMatch(models.Model):
    STATUS_CHOICES = (
        ('SUGGESTED', 'Suggested Match'),
        ('ACCEPTED', 'Accepted by Traveller'),
        ('DECLINED', 'Declined by Traveller'),
    )

    journey = models.ForeignKey('journeys.Journey', on_delete=models.CASCADE, related_name='route_matches')
    request = models.ForeignKey('requests_app.ProductRequest', on_delete=models.CASCADE, related_name='route_matches')
    match_score = models.PositiveIntegerField(default=0)
    detour_distance_km = models.FloatField(default=0.0)
    estimated_travel_time_hours = models.FloatField(default=0.0)
    compatibility_details = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUGGESTED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('journey', 'request')
        ordering = ['-match_score', '-created_at']

    def __str__(self):
        return f"Match ({self.match_score}%) - Journey {self.journey_id} & Request {self.request_id}"

