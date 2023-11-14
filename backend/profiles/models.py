from django.db import models
from django.conf import settings

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='profiles/avatars/', default='static/images/default_avatar.png')
    bio = models.TextField(blank=True)

    def update_avatar(self, new_avatar):
        self.avatar = new_avatar
        self.save()

    def update_bio(self, new_bio):
        self.bio = new_bio
        self.save()

    def __str__(self):
        return self.user.username
