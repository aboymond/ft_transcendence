from django.db import models
from django.conf import settings
from matches.models import Match


class Tournament(models.Model):
    SINGLE_ELIMINATION = "SE"
    ROUND_ROBIN = "RR"

    TOURNAMENT_TYPES = [
        (SINGLE_ELIMINATION, "Single Elimination"),
        (ROUND_ROBIN, "Round Robin"),
    ]

    name = models.CharField(max_length=255)
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="tournaments"
    )
    matches = models.ManyToManyField(Match, related_name="tournaments", blank=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    tournament_type = models.CharField(
        max_length=2, choices=TOURNAMENT_TYPES, default=SINGLE_ELIMINATION
    )
    status = models.CharField(max_length=255, default="Created")


class Round(models.Model):
    tournament = models.ForeignKey(
        Tournament, related_name="rounds", on_delete=models.CASCADE
    )
    round_number = models.IntegerField()
    matches = models.ManyToManyField(Match, related_name="rounds", blank=True)


class MatchmakingQueue(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
