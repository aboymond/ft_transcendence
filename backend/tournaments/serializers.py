from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Tournament
from .models import Match

User = get_user_model()


class TournamentSerializer(serializers.ModelSerializer):
    creator_id = serializers.IntegerField(write_only=True)
    participants = serializers.SlugRelatedField(
        many=True, slug_field="username", queryset=User.objects.all(), required=False
    )
    max_participants = serializers.IntegerField(required = False)

    def create(self, validated_data):
        creator_id = validated_data.pop("creator_id")
        creator = get_object_or_404(User, pk=creator_id)
        tournament = Tournament.objects.create(creator=creator, **validated_data)
        return tournament

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
