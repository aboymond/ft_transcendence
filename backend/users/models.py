from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    display_name = models.CharField(max_length=100, unique=True, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', default='static/images/default_avatar.png')
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username
