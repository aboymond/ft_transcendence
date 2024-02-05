from rest_framework import serializers, generics
from .models import Game
from .models import MatchmakingQueue


class GameSerializer(serializers.ModelSerializer):
    player1 = serializers.SlugRelatedField(read_only=True, slug_field="username")
    player2 = serializers.SlugRelatedField(read_only=True, slug_field="username")

    class Meta:
        model = Game
        fields = "__all__"


class MatchmakingQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchmakingQueue
        fields = "__all__"


class GameListCreateView(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class GameRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
