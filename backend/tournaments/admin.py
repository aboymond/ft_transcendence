from django.contrib import admin
from .models import Tournament # TournamentParticipant

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date')
    search_fields = ('name',)

# @admin.register(TournamentParticipant)
# class TournamentParticipantAdmin(admin.ModelAdmin):
#     list_display = ('user', 'tournament', 'joined_at')
#     search_fields = ('user__username', 'tournament__name')
