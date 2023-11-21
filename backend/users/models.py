from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.paginator import Paginator

class CustomUser(AbstractUser):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('in-game', 'In-Game'),
        ('queuing', 'Queuing'),
    ]

    display_name = models.CharField(max_length=100, unique=True, blank=True, null=True, default=None)
    avatar = models.ImageField(upload_to='avatars/', default='static/images/default_avatar.png')
    bio = models.TextField(blank=True)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    friends = models.ManyToManyField('self', symmetrical=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')

    @property
    def match_history(self):
        all_games = self.games_history_played.all().order_by('-played_at')
        paginator = Paginator(all_games, 10)  # Show 10 games per page
        first_page = paginator.page(1)
        return first_page.object_list

    def __str__(self):
        return self.username

class GameHistory(models.Model):
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='games_history_played')
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='games_history_won')
    played_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game on {self.played_at.strftime('%Y-%m-%d %H:%M')}"

class Friendship(models.Model):
    STATUS_CHOICES = (
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
    )

    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='sent')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('requester', 'receiver')

    def __str__(self):
        return f"{self.requester.username} to {self.receiver.username} - {self.status}"
