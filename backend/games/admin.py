from django.contrib import admin
from .models import Game, Move

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['id', 'state']  # Add other fields as needed

@admin.register(Move)
class MoveAdmin(admin.ModelAdmin):
    list_display = ['game', 'player', 'move_data', 'timestamp']  # Add other fields as needed
