from django.contrib.auth.models import User
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .choices import BookingStatus, PaymentStatus


class Profile(models.Model):
    """
    Additional information about the user.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    bio = models.TextField(
        blank=True,
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    favorite_game = models.ForeignKey(
        "Game",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="favorite_profiles",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["user__username"]
        verbose_name = "Profile"
        verbose_name_plural = "Profiles"

    def __str__(self):
        return f"{self.user.username} Profile"


class Category(models.Model):
    """
    Gaming Room category.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    slug = models.SlugField(
        unique=True,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
    )

    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Game(models.Model):
    """
    Available game.
    """

    title = models.CharField(
        max_length=150,
        unique=True,
        db_index=True,
    )

    genre = models.CharField(
        max_length=100,
    )

    publisher = models.CharField(
        max_length=150,
        blank=True,
    )

    platform = models.CharField(
        max_length=100,
        default="PS5",
    )

    description = models.TextField(
        blank=True,
    )

    cover = models.ImageField(
        upload_to="games/",
        blank=True,
        null=True,
    )

    release_year = models.PositiveIntegerField(
        blank=True,
        null=True,
    )

    multiplayer = models.BooleanField(
        default=True,
    )

    age_rating = models.CharField(
        max_length=20,
        blank=True,
    )

    class Meta:
        ordering = ["title"]
        verbose_name = "Game"
        verbose_name_plural = "Games"

    def __str__(self):
        return self.title

class GamingRoom(models.Model):
    slug = models.SlugField(
        unique=True,
        db_index=True,
    )

    title = models.CharField(
        max_length=150,
        db_index=True,
        unique=True
    )

    description = models.TextField(
        blank=True,
    )

    image = models.ImageField(
        upload_to="gaming_rooms/",
        blank=True,
        null=True,
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="gaming_rooms",
    )

    games = models.ManyToManyField(
        Game,
        related_name="gaming_rooms",
    )

    price_per_hour = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    max_players = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(20),
        ],
    )

    room_number = models.PositiveSmallIntegerField(
        unique=True,
    )

    tv_size = models.PositiveIntegerField(
        help_text="TV size in inches",
        validators=[
            MinValueValidator(24),
            MaxValueValidator(120),
    ]
    )

    supports_4k = models.BooleanField(
        default=True,
    )

    supports_hdr = models.BooleanField(
        default=True,
    )

    ps5_pro = models.BooleanField(
        default=True,
    )

    vr_available = models.BooleanField(
        default=False,
    )

    controllers = models.PositiveIntegerField(
        default=2,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(8),
        ],
    )

    internet_speed = models.CharField(
        max_length=50,
        default="1 Gbps",
    )

    rgb_lighting = models.BooleanField(
        default=True,
    )

    air_conditioner = models.BooleanField(
        default=True,
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(5),
        ],
    )

    is_available = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["title"]

        verbose_name = "Gaming Room"

        verbose_name_plural = "Gaming Rooms"

    def __str__(self):
        return self.title
    
class Booking(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    gaming_room = models.ForeignKey(
        GamingRoom,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    selected_game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    booking_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    hours = models.PositiveSmallIntegerField()

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    booking_status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-booking_date", "-start_time"]
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"

    def __str__(self):
        return (
            f"{self.user.username} — "
            f"{self.gaming_room.title} — "
            f"{self.booking_date}"
        )
    
class Payment(models.Model):

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.WAITING,
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
    )

    payment_method = models.CharField(
        max_length=50,
        default="Simulation",
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    def __str__(self):
        return (
            f"{self.booking.user.username} — "
            f"{self.amount} — "
            f"{self.payment_status}"
        )
    
class Review(models.Model):
    """
    User review for a Gaming Room.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    gaming_room = models.ForeignKey(
        GamingRoom,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
    )

    comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        verbose_name = "Review"

        verbose_name_plural = "Reviews"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "gaming_room",
                ],
                name="unique_user_review",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.gaming_room.title}"
    
class Favorite(models.Model):
    """
    Favorite Gaming Rooms.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="favorites",
    )

    gaming_room = models.ForeignKey(
        GamingRoom,
        on_delete=models.CASCADE,
        related_name="favorites",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

        verbose_name = "Favorite"

        verbose_name_plural = "Favorites"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "gaming_room",
                ],
                name="unique_favorite",
            )
        ]

    def __str__(self):
        return f"{self.user.username} ❤️ {self.gaming_room.title}"
    
class Message(models.Model):
    """
    Chat message.
    """

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_messages",
    )

    text = models.TextField(
        blank=True,
    )

    image = models.ImageField(
        upload_to="chat/",
        blank=True,
        null=True,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["created_at"]

        verbose_name = "Message"

        verbose_name_plural = "Messages"

    def __str__(self):
        return f"{self.sender} → {self.receiver}"
    
class GameScore(models.Model):
    """
    JavaScript game results.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="game_scores",
    )

    score = models.PositiveIntegerField()

    level = models.PositiveSmallIntegerField(
        default=1,
    )

    game_time = models.PositiveIntegerField(
        help_text="Game duration in seconds",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-score"]

        verbose_name = "Game Score"

        verbose_name_plural = "Game Scores"

    def __str__(self):
        return f"{self.user.username} - {self.score}"