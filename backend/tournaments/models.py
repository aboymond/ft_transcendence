# tournaments/models.py
from django.db import models
from users.models import CustomUser

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    participants = models.ManyToManyField(CustomUser, through='TournamentParticipant')

    def __str__(self):
        return self.name

class TournamentParticipant(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'tournament')  # Each user can only join a tournament once

    def __str__(self):
        return f"{self.user} in {self.tournament}"
