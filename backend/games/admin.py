from django.contrib import admin
from .models import Game


class GameAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "player1",
        "player2",
        "status",
        "start_time",
        "end_time",
        "winner",
        "loser",
        "player1_score",
        "player2_score",
    )


admin.site.register(Game, GameAdmin)
