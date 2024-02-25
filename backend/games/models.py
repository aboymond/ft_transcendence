# import operator
from django.db import models
from django.conf import settings
from django_prometheus.models import ExportModelOperationsMixin

BALL_SPEED = 15


class Game(ExportModelOperationsMixin("game"), models.Model):
    STATUS_CHOICES = [
        ("empty", "Empty"),
        ("waiting", "Waiting for Player"),
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    ]

    player1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player1",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    player2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_as_player2",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    max_score = models.IntegerField(default=5)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="empty")
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)

    tournament = models.ForeignKey(
        "tournaments.Tournament",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tournament_games",
    )

    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    loser = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_lost",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    # GameState
    ball_x = models.FloatField(default=0)
    ball_y = models.FloatField(default=0)
    ball_velocity_x = models.FloatField(default=0)
    ball_velocity_y = models.FloatField(default=-BALL_SPEED)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    pad1_x = models.FloatField(default=0)
    pad1_y = models.FloatField(default=0)
    pad2_x = models.FloatField(default=0)
    pad2_y = models.FloatField(default=0)
    player_turn = models.PositiveIntegerField(null=True, blank=True)

    ball_moving = models.BooleanField(default=False)
    paused = models.BooleanField(default=False)

    win_width = models.FloatField(default=426)
    win_height = models.FloatField(default=563)
    ball_width = models.FloatField(default=10)
    pad_width = models.FloatField(default=105)
    pad_height = models.FloatField(default=10)

    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
