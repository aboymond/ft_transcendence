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
        "email"
    )
    search_fields = ("username", "display_name")
    # Add any additional customizations as required


@admin.register(GameHistory)
class GameHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "get_player1_username",
        "get_player2_username",
        "winner",
        "played_at",
        "player1_score",
        "player2_score",
    )
    list_filter = ("played_at", "winner")
    search_fields = ("winner__username", "players__username")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("players")

    def get_player1_username(self, obj):
        return obj.players.all()[0].username

    get_player1_username.short_description = "Player 1"

    def get_player2_username(self, obj):
        return obj.players.all()[1].username

    get_player2_username.short_description = "Player 2"


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("id", "requester", "receiver", "status", "created_at")
    search_fields = ("requester__username", "receiver__username")
    list_filter = ("status",)
