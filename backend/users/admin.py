from django.contrib import admin
from .models import CustomUser, GameHistory


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "username",
        "display_name",
        "bio",
        "wins",
        "losses",
    )  # Adjust the fields as per your model
    search_fields = ("username", "display_name")
    # Add any additional customizations as required


@admin.register(GameHistory)
class GameHistoryAdmin(admin.ModelAdmin):
    list_display = ("played_at", "winner")
    list_filter = ("played_at", "winner")
    search_fields = ("winner__username", "players__username")

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("players")
