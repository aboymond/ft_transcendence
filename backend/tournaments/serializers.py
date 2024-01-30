from rest_framework import serializers
from .models import Tournament
from .models import Match


class TournamentSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(
        many=True, slug_field="username", read_only=True
    )
    max_participants = serializers.IntegerField(required = False)

    class Meta:
        model = Tournament
        fields = "__all__"


class TournamentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = "__all__"


class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = "__all__"
