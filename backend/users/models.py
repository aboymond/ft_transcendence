from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    display_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.username
