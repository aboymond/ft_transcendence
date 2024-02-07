import json
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views import View
from rest_framework import generics, status
from rest_framework.response import Response

from .models import Game
from .serializers import GameSerializer  # GameStateSerializer

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
        serializer.save(
            player1=user, player2=None, status="waiting", player_turn=user.id
        )


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


@method_decorator(csrf_exempt, name="dispatch")
class KeyPressView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        key = data.get("key")
        game = get_object_or_404(Game, id=game_id)

        # Determine which pad to move based on the player_id
        if game.player1_id == player_id:
            pad_x = "pad1_x"
            pad_y = "pad1_y"
        elif game.player2_id == player_id:
            pad_x = "pad2_x"
            pad_y = "pad2_y"
        else:
            return JsonResponse({"error": "Invalid player ID"}, status=400)

        if key == "Space" and game.player_turn == player_id:
            game.ball_moving = True
        elif key in ["ArrowRight", "ArrowLeft"]:
            move_x = 10 if key == "ArrowRight" else -10
            if not (
                (getattr(game, pad_x) + move_x + game.pad_width / 2 > game.win_width)
                or (getattr(game, pad_x) + move_x - game.pad_width / 2 < 0)
            ):
                game.move_pad(player_id, move_x, 0)
        elif key in ["ArrowUp", "ArrowDown"]:
            move_y = 10 if key == "ArrowDown" else -10
            if not (
                (getattr(game, pad_y) + move_y + game.pad_height / 2 > game.win_height)
                or (getattr(game, pad_y) + move_y - game.pad_height / 2 < 0)
            ):
                game.move_pad(player_id, 0, move_y)
        elif key == "Escape":
            game.paused = not game.paused

        game.save()

        return JsonResponse({"status": "success"})
