from django.db import models
from users.models import UserProfile

class Tournament(models.Model):
    name = models.CharField(max_length=255)
    organizer = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    # More fields...

class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE)
    player_one = models.ForeignKey(UserProfile, related_name='matches_as_player_one', on_delete=models.SET_NULL, null=True)
    player_two = models.ForeignKey(UserProfile, related_name='matches_as_player_two', on_delete=models.SET_NULL, null=True)
    # More fields...
