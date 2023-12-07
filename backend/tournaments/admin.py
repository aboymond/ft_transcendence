from django.contrib import admin
from .models import Tournament


class TournamentAdmin(admin.ModelAdmin):
    list_display = [field.name for field in Tournament._meta.fields]


admin.site.register(Tournament, TournamentAdmin)
