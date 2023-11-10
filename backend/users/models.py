from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    # No need to declare 'username' here since it's already part of AbstractUser
    # You can still add additional fields if you need them

    def __str__(self):
        return self.username
