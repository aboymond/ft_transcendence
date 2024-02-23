from django.contrib import admin
from .models import CustomUser, GameHistory, Friendship


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "username",
        "display_name",
        "wins",
        "losses",
        "tournament_wins",
        "status",
        "email",
        "twofa",
        'idft',
        "otp",
        "otp_expiry_time",
    )
    search_fields = ("username", "display_name")
    # Add any additional customizations as required


@admin.register(GameHistory)
class GameHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "player1_username",
        "player2_username",
        "winner_username",
        "played_at",
        "player1_score",
        "player2_score",
    )
    list_filter = ("played_at", "winner")
    search_fields = ("winner__username", "player1__username", "player2__username")

    def player1_username(self, obj):
        return obj.player1.username if obj.player1 else "No Player"

    player1_username.short_description = "Player 1"

    def player2_username(self, obj):
        return obj.player2.username if obj.player2 else "No Player"

    player2_username.short_description = "Player 2"

    def winner_username(self, obj):
        return obj.winner.username if obj.winner else "No Winner"

    winner_username.short_description = "Winner"


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("id", "requester", "receiver", "status", "created_at")
    search_fields = ("requester__username", "receiver__username")
    list_filter = ("status",)
