from django.contrib import admin

from .models import (
    Profile,
    Category,
    Game,
    GamingRoom,
    Booking,
    Payment,
    Review,
    Favorite,
    Message,
    GameScore,
)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "phone",
        "city",
        "favorite_game",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "phone",
        "city",
    )

    list_filter = (
        "city",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "slug",
    )

    search_fields = (
        "name",
        "description",
    )

    prepopulated_fields = {
        "slug": ("name",),
    }


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "genre",
        "publisher",
        "platform",
        "release_year",
        "multiplayer",
        "age_rating",
    )

    search_fields = (
        "title",
        "genre",
        "publisher",
    )

    list_filter = (
        "genre",
        "platform",
        "multiplayer",
        "age_rating",
    )


@admin.register(GamingRoom)
class GamingRoomAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "room_number",
        "category",
        "price_per_hour",
        "max_players",
        "rating",
        "is_available",
        "ps5_pro",
        "vr_available",
    )

    search_fields = (
        "title",
        "description",
        "category__name",
    )

    list_filter = (
        "category",
        "is_available",
        "ps5_pro",
        "vr_available",
        "supports_4k",
        "supports_hdr",
        "rgb_lighting",
        "air_conditioner",
    )

    prepopulated_fields = {
        "slug": ("title",),
    }

    filter_horizontal = (
        "games",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "title",
                    "slug",
                    "description",
                    "image",
                    "category",
                    "games",
                ),
            },
        ),
        (
            "Pricing & Availability",
            {
                "fields": (
                    "price_per_hour",
                    "is_available",
                ),
            },
        ),
        (
            "Room Configuration",
            {
                "fields": (
                    "room_number",
                    "max_players",
                    "tv_size",
                    "controllers",
                ),
            },
        ),
        (
            "Technology",
            {
                "fields": (
                    "ps5_pro",
                    "supports_4k",
                    "supports_hdr",
                    "vr_available",
                    "internet_speed",
                ),
            },
        ),
        (
            "Environment",
            {
                "fields": (
                    "rgb_lighting",
                    "air_conditioner",
                ),
            },
        ),
        (
            "Rating",
            {
                "fields": (
                    "rating",
                ),
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
            },
        ),
    )


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "gaming_room",
        "selected_game",
        "booking_date",
        "start_time",
        "end_time",
        "hours",
        "total_price",
        "booking_status",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "gaming_room__title",
        "selected_game__title",
    )

    list_filter = (
        "booking_status",
        "booking_date",
        "gaming_room",
    )

    date_hierarchy = "booking_date"

    readonly_fields = (
        "created_at",
    )

    autocomplete_fields = (
        "user",
        "gaming_room",
        "selected_game",
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "booking",
        "amount",
        "payment_status",
        "transaction_id",
        "payment_method",
        "paid_at",
    )

    search_fields = (
        "transaction_id",
        "booking__user__username",
        "booking__user__email",
        "booking__gaming_room__title",
    )

    list_filter = (
        "payment_status",
        "payment_method",
        "paid_at",
    )

    readonly_fields = (
        "transaction_id",
        "paid_at",
    )

    autocomplete_fields = (
        "booking",
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "gaming_room",
        "rating",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "gaming_room__title",
        "comment",
    )

    list_filter = (
        "rating",
        "created_at",
        "updated_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "user",
        "gaming_room",
    )


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "gaming_room",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
        "gaming_room__title",
    )

    list_filter = (
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )

    autocomplete_fields = (
        "user",
        "gaming_room",
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "sender",
        "receiver",
        "short_text",
        "is_read",
        "created_at",
    )

    search_fields = (
        "sender__username",
        "sender__email",
        "receiver__username",
        "receiver__email",
        "text",
    )

    list_filter = (
        "is_read",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "sender",
        "receiver",
    )

    @admin.display(description="Message")
    def short_text(self, obj):
        if not obj.text:
            return "[Image]"

        if len(obj.text) > 60:
            return f"{obj.text[:60]}..."

        return obj.text


@admin.register(GameScore)
class GameScoreAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "score",
        "level",
        "game_time",
        "created_at",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    list_filter = (
        "level",
        "created_at",
    )

    ordering = (
        "-score",
    )

    readonly_fields = (
        "created_at",
    )

    autocomplete_fields = (
        "user",
    )