import logging
from rest_framework import serializers
from django.shortcuts import get_object_or_404

from django.contrib.auth import get_user_model

from .models import Tournament
from .models import Match

User = get_user_model()
logger = logging.getLogger(__name__)


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__"


class TournamentCreateSerializer(serializers.ModelSerializer):
    creator_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Tournament
        fields = ["id", "name", "max_participants", "max_score", "creator_id"]

    def create(self, validated_data):
        creator_id = validated_data.pop("creator_id")
        creator = get_object_or_404(User, pk=creator_id)
        name = validated_data.get("name")
        max_participants = validated_data.get("max_participants")
        max_score = validated_data.get("max_score")

        # Logging the request data
        logger.info(
            f"Creating tournament: {name}, Max Participants: {max_participants}, Max Score: {max_score}"
        )

        # Creating the Tournament instance
        tournament = Tournament.objects.create(creator=creator, **validated_data)
        tournament.participants.add(creator)
        return tournament


class TournamentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__"


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"
