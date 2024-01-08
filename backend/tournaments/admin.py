from django.contrib import admin
from .models import Tournament


class TournamentAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Tournament._meta.fields] + ["get_matches"]

    def get_matches(self, obj):
        return ", ".join([str(match) for match in obj.matches.all()])

    get_matches.short_description = "Matches"


admin.site.register(Tournament, TournamentAdmin)
