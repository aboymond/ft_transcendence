from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class CustomUser(AbstractUser):
    display_name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', default='static/images/default_avatar.png')
    bio = models.TextField(blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)

    def __str__(self):
        return self.username

class GameHistory(models.Model):
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='games_history_played')
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='games_history_won')
    played_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game on {self.played_at.strftime('%Y-%m-%d %H:%M')}"
