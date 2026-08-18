from datetime import datetime, time

from django.contrib import messages
from django.contrib.auth import (
    login,
    logout,
    update_session_auth_hash,
)
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render

from .forms import (
    BookingForm,
    GamingRoomSearchForm,
    LoginForm,
    MessageForm,
    PaymentForm,
    ProfileForm,
    RegisterForm,
    ReviewForm,
    UserUpdateForm,
)
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
from .utils import (
    calculate_booking_end_time,
    calculate_booking_price,
    generate_transaction_id,
    get_user_booking_queryset,
    get_user_favorites_queryset,
    is_booking_available,
    update_gaming_room_rating,
)


def home(request):
    popular_rooms = (
        GamingRoom.objects
        .filter(is_available=True)
        .select_related("category")
        .prefetch_related("games")
        .order_by("-rating")[:6]
    )

    return render(
        request,
        "home.html",
        {
            "popular_rooms": popular_rooms,
        },
    )


def gaming_rooms(request):
    rooms = (
        GamingRoom.objects
        .select_related("category")
        .prefetch_related("games")
    )

    form = GamingRoomSearchForm(request.GET or None)

    if form.is_valid():
        query = form.cleaned_data.get("query")
        category = form.cleaned_data.get("category")
        min_price = form.cleaned_data.get("min_price")
        max_price = form.cleaned_data.get("max_price")
        min_players = form.cleaned_data.get("min_players")
        vr_available = form.cleaned_data.get("vr_available")
        ps5_pro = form.cleaned_data.get("ps5_pro")
        supports_4k = form.cleaned_data.get("supports_4k")
        sort = form.cleaned_data.get("sort")

        if query:
            rooms = rooms.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(category__name__icontains=query)
                | Q(games__title__icontains=query)
            ).distinct()

        if category:
            rooms = rooms.filter(
                category_id=category,
            )

        if min_price is not None:
            rooms = rooms.filter(
                price_per_hour__gte=min_price,
            )

        if max_price is not None:
            rooms = rooms.filter(
                price_per_hour__lte=max_price,
            )

        if min_players is not None:
            rooms = rooms.filter(
                max_players__gte=min_players,
            )

        if vr_available:
            rooms = rooms.filter(
                vr_available=True,
            )

        if ps5_pro:
            rooms = rooms.filter(
                ps5_pro=True,
            )

        if supports_4k:
            rooms = rooms.filter(
                supports_4k=True,
            )

        if sort == "price_low":
            rooms = rooms.order_by(
                "price_per_hour",
            )
        elif sort == "price_high":
            rooms = rooms.order_by(
                "-price_per_hour",
            )
        elif sort == "rating":
            rooms = rooms.order_by(
                "-rating",
            )
        else:
            rooms = rooms.order_by(
                "title",
            )

    return render(
        request,
        "gaming_rooms.html",
        {
            "gaming_rooms": rooms,
            "form": form,
        },
    )


def gaming_room_detail(request, slug):
    gaming_room = get_object_or_404(
        GamingRoom.objects
        .select_related("category")
        .prefetch_related(
            "games",
            "reviews__user",
        ),
        slug=slug,
    )

    is_favorite = False
    user_review = None

    if request.user.is_authenticated:
        is_favorite = Favorite.objects.filter(
            user=request.user,
            gaming_room=gaming_room,
        ).exists()

        user_review = Review.objects.filter(
            user=request.user,
            gaming_room=gaming_room,
        ).first()

    return render(
        request,
        "gaming_room_detail.html",
        {
            "gaming_room": gaming_room,
            "is_favorite": is_favorite,
            "user_review": user_review,
        },
    )


def register_view(request):
    if request.user.is_authenticated:
        return redirect("main:profile")

    if request.method == "POST":
        form = RegisterForm(
            request.POST,
        )

        if form.is_valid():
            user = form.save()

            login(
                request,
                user,
            )

            messages.success(
                request,
                "Your account has been created successfully.",
            )

            return redirect(
                "main:profile",
            )
    else:
        form = RegisterForm()

    return render(
        request,
        "register.html",
        {
            "form": form,
        },
    )


def login_view(request):
    if request.user.is_authenticated:
        return redirect("main:profile")

    if request.method == "POST":
        form = LoginForm(
            request,
            data=request.POST,
        )

        if form.is_valid():
            login(
                request,
                form.get_user(),
            )

            messages.success(
                request,
                "Welcome back to PS Lounge.",
            )

            next_url = request.POST.get(
                "next",
            )

            if next_url:
                return redirect(next_url)

            return redirect(
                "main:profile",
            )
    else:
        form = LoginForm()

    return render(
        request,
        "login.html",
        {
            "form": form,
        },
    )


@login_required
def logout_view(request):
    if request.method == "POST":
        logout(request)

        messages.success(
            request,
            "You have been logged out.",
        )

        return redirect(
            "main:home",
        )

    return render(
        request,
        "logout.html",
    )


@login_required
def profile_view(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
    )

    bookings = get_user_booking_queryset(
        request.user,
    )

    favorites = get_user_favorites_queryset(
        request.user,
    )

    payments = Payment.objects.filter(
        booking__user=request.user,
    ).select_related(
        "booking",
        "booking__gaming_room",
    )

    game_scores = GameScore.objects.filter(
        user=request.user,
    )

    reviews = Review.objects.filter(
        user=request.user,
    ).select_related(
        "gaming_room",
    )

    return render(
        request,
        "profile.html",
        {
            "profile": profile,
            "bookings": bookings,
            "favorites": favorites,
            "payments": payments,
            "game_scores": game_scores,
            "reviews": reviews,
        },
    )


@login_required
def profile_edit(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
    )

    if request.method == "POST":
        user_form = UserUpdateForm(
            request.POST,
            instance=request.user,
        )

        profile_form = ProfileForm(
            request.POST,
            request.FILES,
            instance=profile,
        )

        if (
            user_form.is_valid()
            and profile_form.is_valid()
        ):
            user_form.save()
            profile_form.save()

            messages.success(
                request,
                "Your profile has been updated.",
            )

            return redirect(
                "main:profile",
            )
    else:
        user_form = UserUpdateForm(
            instance=request.user,
        )

        profile_form = ProfileForm(
            instance=profile,
        )

    return render(
        request,
        "profile_edit.html",
        {
            "user_form": user_form,
            "profile_form": profile_form,
        },
    )


@login_required
def change_password(request):
    if request.method == "POST":
        form = PasswordChangeForm(
            request.user,
            request.POST,
        )

        if form.is_valid():
            user = form.save()

            update_session_auth_hash(
                request,
                user,
            )

            messages.success(
                request,
                "Your password has been changed.",
            )

            return redirect(
                "main:profile",
            )
    else:
        form = PasswordChangeForm(
            request.user,
        )

    return render(
        request,
        "change_password.html",
        {
            "form": form,
        },
    )


@login_required
def booking_create(request, slug):
    """
    Step 1: validate the booking form and show a confirmation screen.
    The booking is NOT created until the user explicitly confirms it.
    """
    gaming_room = get_object_or_404(
        GamingRoom,
        slug=slug,
        is_available=True,
    )

    if request.method == "POST":
        form = BookingForm(
            request.POST,
            gaming_room=gaming_room,
        )

        if form.is_valid():
            booking_date = form.cleaned_data["booking_date"]
            start_time = form.cleaned_data["start_time"]
            hours = form.cleaned_data["hours"]
            selected_game = form.cleaned_data["selected_game"]

            if not gaming_room.games.filter(
                pk=selected_game.pk,
            ).exists():
                form.add_error(
                    "selected_game",
                    "This game is not available in this Gaming Room.",
                )

            elif booking_date < datetime.now().date():
                form.add_error(
                    "booking_date",
                    "Booking date cannot be in the past.",
                )

            else:
                from datetime import timedelta

                end_datetime = datetime.combine(
                    booking_date,
                    start_time,
                ) + timedelta(hours=hours)

                if end_datetime.date() != booking_date:
                    form.add_error(
                        "hours",
                        "Booking cannot continue into the next day.",
                    )
                else:
                    end_time = end_datetime.time()

                    if not is_booking_available(
                        gaming_room,
                        booking_date,
                        start_time,
                        end_time,
                    ):
                        form.add_error(
                            None,
                            "This time slot is already booked.",
                        )
                    else:
                        total_price = calculate_booking_price(
                            gaming_room,
                            hours,
                        )

                        return render(
                            request,
                            "booking_confirmation.html",
                            {
                                "form": form,
                                "gaming_room": gaming_room,
                                "booking_date": booking_date,
                                "start_time": start_time,
                                "end_time": end_time,
                                "hours": hours,
                                "selected_game": selected_game,
                                "total_price": total_price,
                            },
                        )
    else:
        form = BookingForm(
            gaming_room=gaming_room,
        )

    return render(
        request,
        "booking.html",
        {
            "form": form,
            "gaming_room": gaming_room,
        },
    )


@login_required
@transaction.atomic
def booking_confirm(request, slug):
    """
    Step 2: create the booking only after explicit confirmation.
    The submitted data is validated again so the confirmation screen
    cannot be used to bypass availability or booking rules.
    """
    gaming_room = get_object_or_404(
        GamingRoom,
        slug=slug,
        is_available=True,
    )

    if request.method != "POST":
        return redirect(
            "main:booking_create",
            slug=gaming_room.slug,
        )

    form = BookingForm(
        request.POST,
        gaming_room=gaming_room,
    )

    if not form.is_valid():
        messages.error(
            request,
            "Please review your booking details and try again.",
        )
        return render(
            request,
            "booking.html",
            {
                "form": form,
                "gaming_room": gaming_room,
            },
            status=400,
        )

    booking_date = form.cleaned_data["booking_date"]
    start_time = form.cleaned_data["start_time"]
    hours = form.cleaned_data["hours"]
    selected_game = form.cleaned_data["selected_game"]

    if not gaming_room.games.filter(
        pk=selected_game.pk,
    ).exists():
        form.add_error(
            "selected_game",
            "This game is not available in this Gaming Room.",
        )

    elif booking_date < datetime.now().date():
        form.add_error(
            "booking_date",
            "Booking date cannot be in the past.",
        )

    else:
        from datetime import timedelta

        end_datetime = datetime.combine(
            booking_date,
            start_time,
        ) + timedelta(hours=hours)

        if end_datetime.date() != booking_date:
            form.add_error(
                "hours",
                "Booking cannot continue into the next day.",
            )
        else:
            end_time = end_datetime.time()

            if not is_booking_available(
                gaming_room,
                booking_date,
                start_time,
                end_time,
            ):
                form.add_error(
                    None,
                    "This time slot is no longer available. Please choose another time.",
                )
            else:
                total_price = calculate_booking_price(
                    gaming_room,
                    hours,
                )

                booking = form.save(
                    commit=False,
                )
                booking.user = request.user
                booking.gaming_room = gaming_room
                booking.selected_game = selected_game
                booking.end_time = end_time
                booking.total_price = total_price
                booking.save()

                Payment.objects.create(
                    booking=booking,
                    amount=total_price,
                    transaction_id=generate_transaction_id(),
                )

                messages.success(
                    request,
                    "Your booking has been confirmed.",
                )

                return redirect(
                    "main:booking_detail",
                    booking_id=booking.pk,
                )

    messages.error(
        request,
        "The booking could not be confirmed. Please review the details.",
    )

    return render(
        request,
        "booking.html",
        {
            "form": form,
            "gaming_room": gaming_room,
        },
        status=400,
    )


@login_required
def booking_detail(request, booking_id):
    booking = get_object_or_404(
        Booking.objects.select_related(
            "gaming_room",
            "selected_game",
            "payment",
        ),
        pk=booking_id,
        user=request.user,
    )

    return render(
        request,
        "booking_detail.html",
        {
            "booking": booking,
        },
    )


@login_required
@transaction.atomic
def booking_cancel(request, booking_id):
    booking = get_object_or_404(
        Booking,
        pk=booking_id,
        user=request.user,
    )

    if request.method != "POST":
        return redirect(
            "main:booking_detail",
            booking_id=booking.pk,
        )

    if booking.booking_status in {
        "cancelled",
        "completed",
    }:
        messages.error(
            request,
            "This booking cannot be cancelled.",
        )

        return redirect(
            "main:booking_detail",
            booking_id=booking.pk,
        )

    booking.booking_status = "cancelled"

    booking.save(
        update_fields=[
            "booking_status",
        ],
    )

    messages.success(
        request,
        "Your booking has been cancelled.",
    )

    return redirect(
        "main:profile",
    )


@login_required
@transaction.atomic
def payment_create(request, booking_id):
    booking = get_object_or_404(
        Booking.objects.select_related(
            "gaming_room",
        ),
        pk=booking_id,
        user=request.user,
    )

    payment, created = Payment.objects.get_or_create(
        booking=booking,
        defaults={
            "amount": booking.total_price,
            "transaction_id": generate_transaction_id(),
        },
    )

    if payment.payment_status == "paid":
        return redirect(
            "main:payment_detail",
            payment_id=payment.pk,
        )

    if request.method == "POST":
        form = PaymentForm(
            request.POST,
            instance=payment,
        )

        if form.is_valid():
            payment = form.save(
                commit=False,
            )

            payment.amount = booking.total_price
            payment.payment_status = "paid"
            payment.transaction_id = (
                payment.transaction_id
                or generate_transaction_id()
            )
            payment.paid_at = datetime.now()

            payment.save()

            booking.booking_status = "confirmed"

            booking.save(
                update_fields=[
                    "booking_status",
                ],
            )

            messages.success(
                request,
                "Payment completed successfully.",
            )

            return redirect(
                "main:payment_detail",
                payment_id=payment.pk,
            )
    else:
        form = PaymentForm(
            instance=payment,
        )

    return render(
        request,
        "payment.html",
        {
            "form": form,
            "booking": booking,
            "payment": payment,
        },
    )


@login_required
def payment_detail(request, payment_id):
    payment = get_object_or_404(
        Payment.objects.select_related(
            "booking",
            "booking__gaming_room",
        ),
        pk=payment_id,
        booking__user=request.user,
    )

    return render(
        request,
        "payment_detail.html",
        {
            "payment": payment,
        },
    )


@login_required
def review_create(request, slug):
    gaming_room = get_object_or_404(
        GamingRoom,
        slug=slug,
    )

    review = Review.objects.filter(
        user=request.user,
        gaming_room=gaming_room,
    ).first()

    if review:
        return redirect(
            "main:review_edit",
            review_id=review.id,
        )

    if request.method == "POST":
        form = ReviewForm(request.POST)

        if form.is_valid():
            review = form.save(commit=False)
            review.user = request.user
            review.gaming_room = gaming_room
            review.save()

            update_gaming_room_rating(gaming_room)

            messages.success(
                request,
                "Your review has been published.",
            )

            return redirect(
                "main:gaming_room_detail",
                slug=gaming_room.slug,
            )
    else:
        form = ReviewForm()

    return render(
        request,
        "review_create.html",
        {
            "form": form,
            "gaming_room": gaming_room,
        },
    )


@login_required
def review_edit(request, review_id):
    review = get_object_or_404(
        Review,
        pk=review_id,
        user=request.user,
    )

    if request.method == "POST":
        form = ReviewForm(
            request.POST,
            instance=review,
        )

        if form.is_valid():
            form.save()

            update_gaming_room_rating(
                review.gaming_room,
            )

            messages.success(
                request,
                "Your review has been updated.",
            )

            return redirect(
                "main:gaming_room_detail",
                slug=review.gaming_room.slug,
            )
    else:
        form = ReviewForm(
            instance=review,
        )

    return render(
        request,
        "review_edit.html",
        {
            "form": form,
            "review": review,
        },
    )


@login_required
def review_delete(request, review_id):
    review = get_object_or_404(
        Review,
        pk=review_id,
        user=request.user,
    )

    gaming_room = review.gaming_room

    if request.method == "POST":
        review.delete()

        update_gaming_room_rating(
            gaming_room,
        )

        messages.success(
            request,
            "Your review has been deleted.",
        )

    return redirect(
        "main:gaming_room_detail",
        slug=gaming_room.slug,
    )


@login_required
def favorite_toggle(request, slug):
    gaming_room = get_object_or_404(
        GamingRoom,
        slug=slug,
    )

    if request.method != "POST":
        return redirect(
            "main:gaming_room_detail",
            slug=slug,
        )

    favorite, created = Favorite.objects.get_or_create(
        user=request.user,
        gaming_room=gaming_room,
    )

    if created:
        messages.success(
            request,
            "Gaming Room added to favorites.",
        )
    else:
        favorite.delete()

        messages.success(
            request,
            "Gaming Room removed from favorites.",
        )

    return redirect(
        "main:gaming_room_detail",
        slug=slug,
    )


@login_required
def favorites(request):
    user_favorites = get_user_favorites_queryset(
        request.user,
    )

    return render(
        request,
        "favorites.html",
        {
            "favorites": user_favorites,
        },
    )


@login_required
def chat(request):
    """
    Chat inbox and user search.

    The old implementation passed raw Message objects as `conversations`,
    while the template expected conversation.user / last_message /
    unread_count. It also ignored the `q` search parameter completely.

    This implementation:
    - searches users by username;
    - opens the chat automatically when the search is an exact username;
    - shows matching users when there are several matches;
    - builds a real conversation list with the latest message and unread count.
    """
    query = request.GET.get("q", "").strip()

    users = (
        User.objects
        .filter(is_active=True)
        .exclude(pk=request.user.pk)
        .select_related("profile")
        .order_by("username")
    )

    if query:
        users = users.filter(username__icontains=query)

        # If the entered username matches exactly, go straight to that chat.
        exact_user = users.filter(username__iexact=query).first()
        if exact_user:
            return redirect(
                "main:chat_with_user",
                user_id=exact_user.pk,
            )

    search_results = list(users[:50])

    # Build one inbox item per person with whom the current user has a message.
    message_queryset = (
        Message.objects
        .filter(
            Q(sender=request.user)
            | Q(receiver=request.user)
        )
        .select_related(
            "sender",
            "receiver",
        )
        .order_by("-created_at")
    )

    conversations_by_user = {}

    for message in message_queryset:
        other_user = (
            message.receiver
            if message.sender_id == request.user.id
            else message.sender
        )

        if other_user.id not in conversations_by_user:
            conversations_by_user[other_user.id] = {
                "user": other_user,
                "last_message": message,
                "unread_count": 0,
            }

    # Count unread messages separately so the inbox stays correct even when
    # the newest message in a conversation was sent by the current user.
    unread_rows = (
        Message.objects
        .filter(
            receiver=request.user,
            is_read=False,
        )
        .values("sender_id")
    )

    for row in unread_rows:
        conversation = conversations_by_user.get(row["sender_id"])
        if conversation:
            conversation["unread_count"] += 1

    conversations = sorted(
        conversations_by_user.values(),
        key=lambda item: item["last_message"].created_at,
        reverse=True,
    )

    return render(
        request,
        "chat.html",
        {
            "users": search_results,
            "search_results": search_results,
            "query": query,
            "conversations": conversations,
        },
    )


@login_required
def chat_with_user(request, user_id):
    other_user = get_object_or_404(
        User,
        pk=user_id,
        is_active=True,
    )

    if other_user == request.user:
        messages.error(
            request,
            "You cannot chat with yourself.",
        )

        return redirect(
            "main:chat",
        )

    chat_messages = (
        Message.objects
        .filter(
            Q(
                sender=request.user,
                receiver=other_user,
            )
            | Q(
                sender=other_user,
                receiver=request.user,
            )
        )
        .select_related(
            "sender",
            "receiver",
        )
    )

    unread_messages = Message.objects.filter(
        sender=other_user,
        receiver=request.user,
        is_read=False,
    )

    unread_messages.update(
        is_read=True,
    )

    if request.method == "POST":
        form = MessageForm(
            request.POST,
            request.FILES,
        )

        if form.is_valid():
            message = form.save(
                commit=False,
            )

            message.sender = request.user
            message.receiver = other_user
            message.save()

            return redirect(
                "main:chat_with_user",
                user_id=other_user.pk,
            )
    else:
        form = MessageForm()

    return render(
        request,
        "chat_with_user.html",
        {
            "other_user": other_user,
            "chat_messages": chat_messages,
            "form": form,
        },
    )


@login_required
def send_message(request, user_id):
    receiver = get_object_or_404(
        User,
        pk=user_id,
        is_active=True,
    )

    if receiver == request.user:
        return redirect(
            "main:chat",
        )

    if request.method == "POST":
        form = MessageForm(
            request.POST,
            request.FILES,
        )

        if form.is_valid():
            message = form.save(
                commit=False,
            )

            message.sender = request.user
            message.receiver = receiver
            message.save()

    return redirect(
        "main:chat_with_user",
        user_id=receiver.pk,
    )


@login_required
def mark_message_read(request, message_id):
    message = get_object_or_404(
        Message,
        pk=message_id,
        receiver=request.user,
    )

    if request.method == "POST":
        message.is_read = True

        message.save(
            update_fields=[
                "is_read",
            ],
        )

        return JsonResponse(
            {
                "success": True,
            }
        )

    return JsonResponse(
        {
            "success": False,
            "error": "POST request required.",
        },
        status=405,
    )


@login_required
def game(request):
    return render(
        request,
        "game.html",
    )


@login_required
def save_game_score(request):
    if request.method != "POST":
        return JsonResponse(
            {
                "success": False,
                "error": "POST request required.",
            },
            status=405,
        )

    try:
        score = int(
            request.POST.get(
                "score",
                0,
            )
        )

        level = int(
            request.POST.get(
                "level",
                1,
            )
        )

        game_time = int(
            request.POST.get(
                "game_time",
                0,
            )
        )

    except (TypeError, ValueError):
        return JsonResponse(
            {
                "success": False,
                "error": "Invalid game result.",
            },
            status=400,
        )

    if score < 0:
        return JsonResponse(
            {
                "success": False,
                "error": "Score cannot be negative.",
            },
            status=400,
        )

    if level < 1:
        return JsonResponse(
            {
                "success": False,
                "error": "Level must be at least 1.",
            },
            status=400,
        )

    if game_time < 0:
        return JsonResponse(
            {
                "success": False,
                "error": "Game time cannot be negative.",
            },
            status=400,
        )

    game_score = GameScore.objects.create(
        user=request.user,
        score=score,
        level=level,
        game_time=game_time,
    )

    return JsonResponse(
        {
            "success": True,
            "score_id": game_score.pk,
            "score": game_score.score,
        }
    )


@login_required
def leaderboard(request):
    scores = (
        GameScore.objects
        .select_related("user")
        .order_by(
            "-score",
            "game_time",
            "created_at",
        )
    )

    leaderboard_data = []

    users_seen = set()

    for score in scores:
        if score.user_id in users_seen:
            continue

        users_seen.add(
            score.user_id,
        )

        leaderboard_data.append(
            score,
        )

    leaderboard_data = leaderboard_data[:100]

    return render(
        request,
        "leaderboard.html",
        {
            "leaderboard": leaderboard_data,
        },
    )