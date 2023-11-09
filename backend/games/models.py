from django.db import models
from users.models import UserProfile

class Game(models.Model):
    players = models.ManyToManyField(UserProfile)
    state = models.JSONField()
    # More fields...

class Move(models.Model):
    game = models.ForeignKey(Game, related_name='moves', on_delete=models.CASCADE)
    player = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    move_data = models.JSONField()
    timestamp = models.DateTimeField(auto_now_add=True)
    # More fields...
