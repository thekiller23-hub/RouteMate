from django.db import models
from django.conf import settings

class ProductRequest(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open for Offers'),
        ('MATCHED', 'Traveller Matched'),
        ('ACCEPTED', 'Accepted by Traveller'),
        ('COLLECTED', 'Product Collected'),
        ('IN_TRANSIT', 'In Transit'),
        ('ARRIVED', 'Arrived at Destination'),
        ('DELIVERED', 'Delivered & Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )

    CATEGORY_CHOICES = (
        ('ELECTRONICS', 'Electronics & Gadgets'),
        ('FOOD_SWEETS', 'Regional Sweets & Specialty Foods'),
        ('FASHION', 'Fashion & Traditional Wear'),
        ('DOCUMENTS', 'Urgent Documents & Certificates'),
        ('HANDICRAFTS', 'Handicrafts & Art'),
        ('BOOKS', 'Books & Educational Material'),
        ('HEALTH', 'Medicines & Personal Care'),
        ('OTHER', 'Other Permitted Items'),
    )

    SOURCE_CHOICES = (
        ('PHYSICAL_STORE', 'Physical Store / Shop'),
        ('LOCAL_MARKET', 'Local Market / Bazaar'),
        ('MALL', 'Shopping Mall'),
        ('INDIVIDUAL_SELLER', 'Individual Seller / Friend'),
        ('OTHER', 'Other Permitted Source'),
    )

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='product_requests')
    
    # Product Information
    product_name = models.CharField(max_length=255)
    product_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='OTHER')
    product_description = models.TextField(blank=True, default='')
    product_image = models.ImageField(upload_to='product_requests/', null=True, blank=True)
    product_image_url = models.URLField(max_length=500, blank=True, default='')
    quantity = models.PositiveIntegerField(default=1)
    product_source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='PHYSICAL_STORE')

    # Origin / Pickup Details
    pickup_address = models.CharField(max_length=255)
    pickup_city = models.CharField(max_length=100)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lng = models.FloatField(null=True, blank=True)

    # Destination / Delivery Details
    destination_address = models.CharField(max_length=255)
    destination_city = models.CharField(max_length=100)
    destination_lat = models.FloatField(null=True, blank=True)
    destination_lng = models.FloatField(null=True, blank=True)

    # Financials (Using Decimals)
    max_budget = models.DecimalField(max_digits=10, decimal_places=2, help_text="Maximum budget for the item itself")
    traveller_reward = models.DecimalField(max_digits=10, decimal_places=2, help_text="Agreed reward for the traveller")

    # Scheduling
    required_delivery_date = models.DateField()
    additional_instructions = models.TextField(blank=True, default='')

    # Lifecycle Status
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='OPEN')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['pickup_city', 'destination_city']),
        ]

    def __str__(self):
        return f"{self.product_name} ({self.pickup_city} -> {self.destination_city}) - {self.status}"

