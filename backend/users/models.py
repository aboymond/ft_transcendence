from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django_prometheus.models import ExportModelOperationsMixin


class CustomUser(ExportModelOperationsMixin("CustomUser"), AbstractUser):
    STATUS_CHOICES = [
        ("online", "Online"),
        ("offline", "Offline"),
        ("in-game", "In-Game"),
        ("queuing", "Queuing"),
    ]

    display_name = models.CharField(
        max_length=100, unique=True, blank=True, null=True, default=None
    )
    avatar = models.ImageField(
        upload_to="avatars/", default="avatars/default_avatar.png"
    )
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    tournament_wins = models.IntegerField(default=0)
    friends = models.ManyToManyField("self", symmetrical=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="offline")
    email = models.EmailField(unique=True, blank=False, null=False)

    @property
    def match_history(self):
        return GameHistory.objects.filter(players=self).order_by("-played_at")

    def __str__(self):
        return self.username


class GameHistory(ExportModelOperationsMixin("GameHistory"), models.Model):
    players = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="games_history_played"
    )
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="games_history_won",
    )
    played_at = models.DateTimeField(auto_now_add=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)

    def __str__(self):
        return f"Game on {self.played_at.strftime('%Y-%m-%d %H:%M')}"


class TournamentHistory(ExportModelOperationsMixin('TournamentHistory'), models.Model):
    players = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="tournament_history_played"
    )
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="tournament_history_won",
    )
    played_at = models.DateTimeField(auto_now_add=True)
    rank = models.IntegerField(default=0)

    def __str__(self):
        return f"Tournament on {self.played_at.strftime('%Y-%m-%d %H:%M')}"


class Friendship(ExportModelOperationsMixin('Friendship'), models.Model):
    STATUS_CHOICES = (
        ("sent", "Sent"),
        ("accepted", "Accepted"),
    )

    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_requests"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_requests",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="sent")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("requester", "receiver")

    def __str__(self):
        return f"{self.requester.username} to {self.receiver.username} - {self.status}"
