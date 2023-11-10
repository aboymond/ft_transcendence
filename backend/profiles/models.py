# profiles/models.py
from django.db import models
from users.models import CustomUser

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='profiles/avatars/', default='profiles/avatars/default.jpg')
    bio = models.TextField(blank=True)
    # Add fields for game statistics if needed

    def __str__(self):
        return f"Profile of {self.user.username}"
