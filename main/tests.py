from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import (
    Booking,
    Category,
    Favorite,
    Game,
    GameScore,
    GamingRoom,
    Message,
    Payment,
    Profile,
    Review,
)


class ProfileSignalTests(TestCase):
    def test_profile_is_created_for_new_user(self):
        user = User.objects.create_user(
            username="testuser",
            password="TestPassword123!",
        )

        self.assertTrue(
            Profile.objects.filter(
                user=user,
            ).exists()
        )

    def test_profile_is_created_for_existing_user_without_profile(self):
        user = User.objects.create_user(
            username="testuser",
            password="TestPassword123!",
        )

        Profile.objects.filter(
            user=user,
        ).delete()

        user.save()

        self.assertTrue(
            Profile.objects.filter(
                user=user,
            ).exists()
        )


class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="TestPassword123!",
        )

        self.category = Category.objects.create(
            name="VIP",
            slug="vip",
            description="VIP Gaming Room",
        )

        self.game = Game.objects.create(
            title="Battlefield 6",
            genre="Shooter",
            publisher="EA",
            platform="PS5",
            multiplayer=True,
        )

        self.room = GamingRoom.objects.create(
            title="PS Lounge VIP 01",
            slug="ps-lounge-vip-01",
            description="Premium Gaming Room",
            category=self.category,
            price_per_hour=Decimal("25.00"),
            max_players=4,
            room_number=1,
            tv_size=55,
            supports_4k=True,
            supports_hdr=True,
            ps5_pro=True,
            vr_available=False,
            controllers=4,
            internet_speed="1 Gbps",
            rgb_lighting=True,
            air_conditioner=True,
        )

        self.room.games.add(
            self.game,
        )

    def test_category_creation(self):
        self.assertEqual(
            self.category.name,
            "VIP",
        )

    def test_game_creation(self):
        self.assertEqual(
            self.game.title,
            "Battlefield 6",
        )

    def test_gaming_room_creation(self):
        self.assertEqual(
            self.room.title,
            "PS Lounge VIP 01",
        )

    def test_gaming_room_category_relationship(self):
        self.assertEqual(
            self.room.category,
            self.category,
        )

    def test_gaming_room_game_relationship(self):
        self.assertIn(
            self.game,
            self.room.games.all(),
        )

    def test_review_unique_constraint(self):
        Review.objects.create(
            user=self.user,
            gaming_room=self.room,
            rating=5,
            comment="Excellent room!",
        )

        with self.assertRaises(Exception):
            Review.objects.create(
                user=self.user,
                gaming_room=self.room,
                rating=4,
                comment="Second review.",
            )

    def test_favorite_unique_constraint(self):
        Favorite.objects.create(
            user=self.user,
            gaming_room=self.room,
        )

        with self.assertRaises(Exception):
            Favorite.objects.create(
                user=self.user,
                gaming_room=self.room,
            )


class BookingTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="bookinguser",
            password="TestPassword123!",
        )

        self.category = Category.objects.create(
            name="Standard",
            slug="standard",
        )

        self.game = Game.objects.create(
            title="Call of Duty",
            genre="Shooter",
        )

        self.room = GamingRoom.objects.create(
            title="Standard Room 01",
            slug="standard-room-01",
            category=self.category,
            price_per_hour=Decimal("15.00"),
            max_players=4,
            room_number=1,
            tv_size=55,
        )

        self.room.games.add(
            self.game,
        )

    def test_booking_creation(self):
        booking = Booking.objects.create(
            user=self.user,
            gaming_room=self.room,
            selected_game=self.game,
            booking_date="2026-08-20",
            start_time="18:00",
            end_time="20:00",
            hours=2,
            total_price=Decimal("30.00"),
        )

        self.assertEqual(
            booking.total_price,
            Decimal("30.00"),
        )

        self.assertEqual(
            booking.user,
            self.user,
        )

        self.assertEqual(
            booking.gaming_room,
            self.room,
        )


class PaymentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="paymentuser",
            password="TestPassword123!",
        )

        self.category = Category.objects.create(
            name="Premium",
            slug="premium",
        )

        self.game = Game.objects.create(
            title="Gran Turismo 7",
            genre="Racing",
        )

        self.room = GamingRoom.objects.create(
            title="Premium Room 01",
            slug="premium-room-01",
            category=self.category,
            price_per_hour=Decimal("20.00"),
            max_players=4,
            room_number=1,
            tv_size=65,
        )

        self.room.games.add(
            self.game,
        )

        self.booking = Booking.objects.create(
            user=self.user,
            gaming_room=self.room,
            selected_game=self.game,
            booking_date="2026-08-21",
            start_time="18:00",
            end_time="20:00",
            hours=2,
            total_price=Decimal("40.00"),
        )

    def test_payment_creation(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=Decimal("40.00"),
            transaction_id="TEST-TRANSACTION-001",
        )

        self.assertEqual(
            payment.amount,
            Decimal("40.00"),
        )

        self.assertEqual(
            payment.booking,
            self.booking,
        )


class MessageTests(TestCase):
    def setUp(self):
        self.sender = User.objects.create_user(
            username="sender",
            password="TestPassword123!",
        )

        self.receiver = User.objects.create_user(
            username="receiver",
            password="TestPassword123!",
        )

    def test_text_message_creation(self):
        message = Message.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            text="Hello!",
        )

        self.assertEqual(
            message.text,
            "Hello!",
        )

        self.assertFalse(
            message.is_read,
        )


class GameScoreTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="player",
            password="TestPassword123!",
        )

    def test_game_score_creation(self):
        score = GameScore.objects.create(
            user=self.user,
            score=1500,
            level=5,
            game_time=120,
        )

        self.assertEqual(
            score.score,
            1500,
        )

    def test_leaderboard_order(self):
        GameScore.objects.create(
            user=self.user,
            score=1000,
            level=3,
            game_time=100,
        )

        second_user = User.objects.create_user(
            username="player2",
            password="TestPassword123!",
        )

        GameScore.objects.create(
            user=second_user,
            score=2000,
            level=5,
            game_time=120,
        )

        leaderboard = GameScore.objects.order_by(
            "-score"
        )

        self.assertEqual(
            leaderboard.first().score,
            2000,
        )


class AuthenticationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="authuser",
            password="TestPassword123!",
        )

    def test_login(self):
        logged_in = self.client.login(
            username="authuser",
            password="TestPassword123!",
        )

        self.assertTrue(
            logged_in,
        )

    def test_invalid_login(self):
        logged_in = self.client.login(
            username="authuser",
            password="WrongPassword123!",
        )

        self.assertFalse(
            logged_in,
        )


class ViewTests(TestCase):
    def test_home_page(self):
        response = self.client.get(
            reverse("main:home")
        )

        self.assertEqual(
            response.status_code,
            200,
        )

    def test_gaming_rooms_page(self):
        response = self.client.get(
            reverse("main:gaming_rooms")
        )

        self.assertEqual(
            response.status_code,
            200,
        )