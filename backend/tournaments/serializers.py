from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Tournament
from .models import Round


class TournamentSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=get_user_model().objects.all(), required=False
    )

    class Meta:
        model = Tournament
        fields = "__all__"


class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = "__all__"
