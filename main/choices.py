from django.db import models


class BookingStatus(models.TextChoices):
    PENDING = "Pending", "Pending"
    CONFIRMED = "Confirmed", "Confirmed"
    CANCELLED = "Cancelled", "Cancelled"
    COMPLETED = "Completed", "Completed"


class PaymentStatus(models.TextChoices):
    WAITING = "Waiting", "Waiting"
    PAID = "Paid", "Paid"
    FAILED = "Failed", "Failed"