from django.db import models
from django.conf import settings

class PlayerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    elo_rating = models.IntegerField(default=1000)  # ELO rating for each player

class Tournament(models.Model):
    SINGLE_ELIMINATION = 'SE'
    ROUND_ROBIN = 'RR'

    TOURNAMENT_TYPES = [
        (SINGLE_ELIMINATION, 'Single Elimination'),
        (ROUND_ROBIN, 'Round Robin'),
    ]

    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    tournament_type = models.CharField(max_length=2, choices=TOURNAMENT_TYPES, default=SINGLE_ELIMINATION)

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='matches_as_player2', on_delete=models.CASCADE)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    match_date = models.DateTimeField()

class Round(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='rounds', on_delete=models.CASCADE)
    round_number = models.IntegerField()
    matches = models.ManyToManyField(TournamentMatch)

class MatchmakingQueue(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    # Additional fields like 'preferred_tournament_type' can be added
