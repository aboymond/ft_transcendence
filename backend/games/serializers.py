from rest_framework import serializers
from .models import Game
from .models import MatchmakingQueue


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = "__all__"


class MatchmakingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchmakingQueue
        fields = "__all__"
