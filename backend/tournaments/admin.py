from django.contrib import admin
from .models import Tournament


class TournamentAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Tournament._meta.fields] + [
        "get_matches",
        "get_participants",
    ]

    def get_matches(self, obj):
        return ", ".join([str(match) for match in obj.matches.all()])

    get_matches.short_description = "Matches"

    def get_participants(self, obj):
        # Assuming your Tournament model has a many-to-many field to User named 'participants'
        return ", ".join([str(participant) for participant in obj.participants.all()])

    get_participants.short_description = "Participants"


admin.site.register(Tournament, TournamentAdmin)
