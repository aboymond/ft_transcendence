from django.contrib import admin
from .models import Game

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('player1', 'player2', 'start_time', 'end_time', 'winner')
    search_fields = ('player1__username', 'player2__username')
