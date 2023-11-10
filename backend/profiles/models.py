from django.db import models
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='profiles/avatars/', default='profiles/avatars/default.jpg')
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.user.username
