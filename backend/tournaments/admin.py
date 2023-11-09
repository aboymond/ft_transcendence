from django.contrib import admin
from .models import Tournament, Match

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ['name', 'organizer', 'start_date', 'end_date']

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['tournament', 'player_one', 'player_two', 'scheduled_time']
