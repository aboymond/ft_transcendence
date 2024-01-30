from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Tournament
from .models import Match


class TournamentSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=get_user_model().objects.all(), required=False
    )
    max_participants = serializers.IntegerField(required = False)

    class Meta:
        model = Tournament
        fields = "__all__"


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"
