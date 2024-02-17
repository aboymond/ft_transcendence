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


class TournamentDetailSerializer(serializers.ModelSerializer):
    participants_usernames = serializers.SerializerMethodField()
    creator_username = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Tournament
        fields = [
            "id",
            "name",
            "max_participants",
            "max_score",
            "status",
            "creator_username",
            "participants_usernames",
        ]

    def get_participants_usernames(self, obj):
        return [user.username for user in obj.participants.all()]


class MatchSerializer(serializers.ModelSerializer):
    player1_username = serializers.SerializerMethodField()
    player2_username = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = [
            "id",
            "player1",
            "player2",
            "game",
            "round_number",
            "match_order",
            "player1_username",
            "player2_username",
        ]

    def get_player1_username(self, obj):
        return obj.player1.username

    def get_player2_username(self, obj):
        return obj.player2.username


class TournamentIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ["id"]
