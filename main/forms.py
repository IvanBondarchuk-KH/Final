from django import forms
from django.contrib.auth.forms import (
    AuthenticationForm,
    PasswordChangeForm,
    UserCreationForm,
)
from django.contrib.auth.models import User

from .models import (
    Booking,
    Favorite,
    GameScore,
    GamingRoom,
    Message,
    Payment,
    Profile,
    Review,
)


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
    )

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "password1",
            "password2",
        )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError(
                "A user with this email already exists."
            )

        return email


class LoginForm(AuthenticationForm):
    username = forms.CharField(
        max_length=150,
    )

    password = forms.CharField(
        widget=forms.PasswordInput,
    )


class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = (
            "avatar",
            "phone",
            "bio",
            "date_of_birth",
            "city",
            "favorite_game",
        )

        widgets = {
            "date_of_birth": forms.DateInput(
                attrs={
                    "type": "date",
                },
            ),
            "bio": forms.Textarea(
                attrs={
                    "rows": 5,
                },
            ),
        }


class UserUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
        )

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        queryset = User.objects.filter(
            email__iexact=email,
        ).exclude(
            pk=self.instance.pk,
        )

        if queryset.exists():
            raise forms.ValidationError(
                "A user with this email already exists."
            )

        return email

class GamingRoomSearchForm(forms.Form):
    query = forms.CharField(
        required=False,
        max_length=150,
    )

    category = forms.IntegerField(
        required=False,
    )

    min_price = forms.DecimalField(
        required=False,
        min_value=0,
        decimal_places=2,
    )

    max_price = forms.DecimalField(
        required=False,
        min_value=0,
        decimal_places=2,
    )

    min_players = forms.IntegerField(
        required=False,
        min_value=1,
    )

    vr_available = forms.BooleanField(
        required=False,
    )

    ps5_pro = forms.BooleanField(
        required=False,
    )

    supports_4k = forms.BooleanField(
        required=False,
    )

    sort = forms.ChoiceField(
        required=False,
        choices=(
            ("title", "Name"),
            ("price_low", "Price: Low to High"),
            ("price_high", "Price: High to Low"),
            ("rating", "Rating"),
        ),
    )

    def clean(self):
        cleaned_data = super().clean()

        min_price = cleaned_data.get("min_price")
        max_price = cleaned_data.get("max_price")

        if (
            min_price is not None
            and max_price is not None
            and min_price > max_price
        ):
            raise forms.ValidationError(
                "Minimum price cannot be greater than maximum price."
            )

        return cleaned_data


class BookingForm(forms.ModelForm):
    class Meta:
        model = Booking
        fields = (
            "gaming_room",
            "selected_game",
            "booking_date",
            "start_time",
            "hours",
        )

        widgets = {
            "booking_date": forms.DateInput(
                attrs={
                    "type": "date",
                },
            ),
            "start_time": forms.TimeInput(
                attrs={
                    "type": "time",
                },
            ),
        }

    def __init__(self, *args, **kwargs):
        gaming_room = kwargs.pop(
            "gaming_room",
            None,
        )

        super().__init__(*args, **kwargs)

        if gaming_room is not None:
            self.fields["gaming_room"].queryset = (
                GamingRoom.objects.filter(
                    pk=gaming_room.pk,
                    is_available=True,
                )
            )

            self.fields["selected_game"].queryset = (
                gaming_room.games.all()
            )

    def clean_hours(self):
        hours = self.cleaned_data["hours"]

        if hours < 1:
            raise forms.ValidationError(
                "Booking duration must be at least 1 hour."
            )

        if hours > 24:
            raise forms.ValidationError(
                "Booking duration cannot exceed 24 hours."
            )

        return hours


class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = (
            "payment_method",
        )

        widgets = {
            "payment_method": forms.Select(
                choices=(
                    ("Simulation", "Simulation"),
                ),
            ),
        }


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = (
            "rating",
            "comment",
        )

        widgets = {
            "comment": forms.Textarea(
                attrs={
                    "rows": 5,
                    "maxlength": 2000,
                },
            ),
        }

    def clean_rating(self):
        rating = self.cleaned_data["rating"]

        if not 1 <= rating <= 5:
            raise forms.ValidationError(
                "Rating must be between 1 and 5."
            )

        return rating


class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = (
            "text",
            "image",
        )

        widgets = {
            "text": forms.Textarea(
                attrs={
                    "rows": 3,
                    "maxlength": 5000,
                },
            ),
        }

    def clean(self):
        cleaned_data = super().clean()

        text = cleaned_data.get("text")
        image = cleaned_data.get("image")

        if not text and not image:
            raise forms.ValidationError(
                "Message must contain text or an image."
            )

        return cleaned_data


class FavoriteForm(forms.ModelForm):
    class Meta:
        model = Favorite
        fields = (
            "gaming_room",
        )


class GameScoreForm(forms.ModelForm):
    class Meta:
        model = GameScore
        fields = (
            "score",
            "level",
            "game_time",
        )

    def clean_score(self):
        score = self.cleaned_data["score"]

        if score < 0:
            raise forms.ValidationError(
                "Score cannot be negative."
            )

        return score

    def clean_level(self):
        level = self.cleaned_data["level"]

        if level < 1:
            raise forms.ValidationError(
                "Level must be at least 1."
            )

        return level

    def clean_game_time(self):
        game_time = self.cleaned_data["game_time"]

        if game_time < 0:
            raise forms.ValidationError(
                "Game time cannot be negative."
            )

        return game_time