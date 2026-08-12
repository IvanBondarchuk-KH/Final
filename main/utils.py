import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Avg

from .models import Booking, GamingRoom


def calculate_booking_end_time(
    start_time,
    hours,
):
    start_datetime = datetime.combine(
        datetime.today(),
        start_time,
    )

    end_datetime = start_datetime + timedelta(
        hours=hours,
    )

    return end_datetime.time()


def calculate_booking_price(
    gaming_room,
    hours,
):
    return (
        gaming_room.price_per_hour
        * Decimal(hours)
    )


def is_booking_available(
    gaming_room,
    booking_date,
    start_time,
    end_time,
    exclude_booking_id=None,
):
    bookings = Booking.objects.filter(
        gaming_room=gaming_room,
        booking_date=booking_date,
        booking_status__in=[
            "pending",
            "confirmed",
        ],
    )

    if exclude_booking_id is not None:
        bookings = bookings.exclude(
            pk=exclude_booking_id,
        )

    return not bookings.filter(
        start_time__lt=end_time,
        end_time__gt=start_time,
    ).exists()


def generate_transaction_id():
    return f"PSL-{uuid.uuid4().hex.upper()}"


def update_gaming_room_rating(
    gaming_room,
):
    average_rating = gaming_room.reviews.aggregate(
        average=Avg("rating"),
    )["average"]

    gaming_room.rating = (
        Decimal(str(round(average_rating, 2)))
        if average_rating is not None
        else Decimal("0.00")
    )

    gaming_room.save(
        update_fields=[
            "rating",
            "updated_at",
        ],
    )


def get_user_booking_queryset(user):
    return (
        Booking.objects
        .filter(user=user)
        .select_related(
            "gaming_room",
            "selected_game",
            "payment",
        )
    )


def get_user_favorites_queryset(user):
    return (
        user.favorites
        .select_related(
            "gaming_room",
            "gaming_room__category",
        )
    )