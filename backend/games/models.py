from django.db import models
from django.conf import settings


class Game(models.Model):
    STATUS_CHOICES = [
        ("waiting", "Waiting for Player"),
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
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="waiting")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="games_won",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    @property
    def is_full(self):
        return self.player1 is not None and self.player2 is not None

    @classmethod
    def find_or_create_game(cls, user):
        queue = MatchmakingQueue.objects.order_by("timestamp")
        if queue.exists():
            opponent = queue.first().player
            queue.first().delete()
            game = cls.objects.create(
                player1=user, player2=opponent, status="in_progress"
            )
        else:
            MatchmakingQueue.objects.create(player=user)
            game = None
        return game


class MatchmakingQueue(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
