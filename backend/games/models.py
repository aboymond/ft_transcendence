from django.db import models
from users.models import CustomUser

class Game(models.Model):
    player1 = models.ForeignKey(CustomUser, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='games_as_player2', on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    winner = models.ForeignKey(CustomUser, related_name='games_won', on_delete=models.SET_NULL, null=True, blank=True)
    # Game state JSON or a more complex state can be stored here depending on the game mechanics
    game_state = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.player1} vs {self.player2}"
