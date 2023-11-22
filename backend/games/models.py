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
        game = cls.objects.filter(status="waiting").exclude(player1=user).first()

        if game:
            game.player2 = user
            game.status = "in_progress"
            game.save()
        else:
            game = cls.objects.create(player1=user)

        return game
