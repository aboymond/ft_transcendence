from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # additional fields like phone_number for 2FA
    phone_number = models.CharField(max_length=15, blank=True)
    two_factor_enabled = models.BooleanField(default=False)
