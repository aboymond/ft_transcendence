import json
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views import View
from rest_framework import generics, status
from rest_framework.response import Response

# from rest_framework.views import APIView
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


@method_decorator(csrf_exempt, name="dispatch")
class KeyPressView(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body)
        game_id = data.get("game_id")
        player_id = data.get("player_id")
        key = data.get("key")

        # TODO Handle up and down key presses ?
        game = get_object_or_404(Game, id=game_id)
        if key == "ArrowRight":
            game.move_pad(player_id, 10)  # Move pad to the right
        elif key == "ArrowLeft":
            game.move_pad(player_id, -10)  # Move pad to the left
        game.save()

        return JsonResponse({"status": "success"})


# class InitGameStateView(APIView):
#     def post(self, request, *args, **kwargs):
#         serializer = GameStateSerializer(data=request.data)
#         if serializer.is_valid():
#             print("Game state initialized")
#             game_id = kwargs.get("game_id")
#             game = get_object_or_404(Game, pk=game_id)
#             game_data = serializer.validated_data
#             game.ball_x = game_data["ballPosition"]["x"]
#             game.ball_y = game_data["ballPosition"]["y"]
#             game.ball_velocity_x = game_data["ballVelocity"]["x"]
#             game.ball_velocity_y = game_data["ballVelocity"]["y"]
#             game.player1_score = game_data["player1Score"]
#             game.player2_score = game_data["player2Score"]
#             game.pad1_x = game_data["pad1"]["x"]
#             game.pad1_y = game_data["pad1"]["y"]
#             game.pad2_x = game_data["pad2"]["x"]
#             game.pad2_y = game_data["pad2"]["y"]
#             game.player_turn = game_data["playerTurn"]
#             game.width = game_data["winWidth"]
#             game.height = game_data["winHeight"]
#             game.save()
#             return Response({"message": "Game state initialized"}, status=200)
#         return Response(serializer.errors, status=400)
