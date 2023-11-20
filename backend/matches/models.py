from django.db import models
from django.conf import settings
from games.models import Game

class Match(models.Model):
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    game = models.ForeignKey(Game, on_delete=models.SET_NULL, null=True, blank=True)
