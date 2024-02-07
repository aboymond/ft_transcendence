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


# class GameStateSerializer(serializers.Serializer):
#     ballPosition = serializers.DictField(child=serializers.IntegerField())
#     ballVelocity = serializers.DictField(child=serializers.IntegerField())
#     pad1 = serializers.DictField(child=serializers.IntegerField())
#     pad2 = serializers.DictField(child=serializers.IntegerField())
#     player1_score = serializers.IntegerField()
#     player2_score = serializers.IntegerField()
#     playerTurn = serializers.IntegerField()
#     winWidth = serializers.IntegerField()
#     winHeight = serializers.IntegerField()
