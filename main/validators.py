from decimal import Decimal

from django.core.exceptions import ValidationError


def validate_positive_price(value):
    if value <= Decimal("0"):
        raise ValidationError(
            "Price must be greater than zero."
        )


def validate_image_size(image):
    max_size = 5 * 1024 * 1024

    if image.size > max_size:
        raise ValidationError(
            "Image size cannot exceed 5 MB."
        )


def validate_image_extension(image):
    allowed_extensions = {
        "jpg",
        "jpeg",
        "png",
        "webp",
    }

    extension = image.name.rsplit(
        ".",
        1,
    )[-1].lower()

    if extension not in allowed_extensions:
        raise ValidationError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )


def validate_booking_hours(value):
    if value < 1:
        raise ValidationError(
            "Booking duration must be at least 1 hour."
        )

    if value > 24:
        raise ValidationError(
            "Booking duration cannot exceed 24 hours."
        )


def validate_rating(value):
    if value < 1 or value > 5:
        raise ValidationError(
            "Rating must be between 1 and 5."
        )


def validate_score(value):
    if value < 0:
        raise ValidationError(
            "Score cannot be negative."
        )


def validate_game_time(value):
    if value < 0:
        raise ValidationError(
            "Game time cannot be negative."
        )