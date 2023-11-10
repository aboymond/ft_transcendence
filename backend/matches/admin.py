# matches/admin.py
from django.contrib import admin
from .models import Match

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('game', 'player1_score', 'player2_score', 'played_at')
    search_fields = ('game__player1__username', 'game__player2__username')
