from rest_framework import serializers
from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'avatar', 'bio']
        read_only_fields = ['id']  # 'id' is read-only.
