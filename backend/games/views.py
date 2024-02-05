from rest_framework import generics, status
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()


class GameListCreateView(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class GameRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class CreateGameView(generics.CreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def perform_create(self, serializer):
        user_id = self.request.data.get("user_id")
        user = get_object_or_404(User, pk=user_id)
        serializer.save(player1=user, player2=None, status="waiting")


class JoinGameView(generics.UpdateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def patch(self, request, *args, **kwargs):
        game = self.get_object()
        user_id = request.data.get("user_id")
        user = get_object_or_404(User, pk=user_id)

        if game.player2 is not None:
            return Response(
                {"error": "The game is already full"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        game.player2 = user
        game.status = "in_progress"
        game.save()

        return Response(self.get_serializer(game).data, status=status.HTTP_200_OK)
