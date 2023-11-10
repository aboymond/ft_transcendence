# matches/models.py
from django.db import models
from games.models import Game

class Match(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='matches')
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    played_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Match {self.game} on {self.played_at}"
