import json
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.views import View
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Game
from .serializers import GameSerializer  # GameStateSerializer
from .utils import handle_leave_game

User = get_user_model()


class GameListCreateView(generics.ListCreateAPIView):
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
        user = request.user

        # Check if the game is empty and add the user as the first player
        if not game.player1:
            game.player1 = user
            game.save()
            return Response(self.get_serializer(game).data, status=status.HTTP_200_OK)

        # If the game already has a first player, add the user as the second player
        elif not game.player2 and game.player1 != user:
            game.player2 = user
            game.status = "in_progress"  # Optionally, change the game status
            game.save()
            return Response(self.get_serializer(game).data, status=status.HTTP_200_OK)

        # If the game is full or the user is already in the game, return an error
        else:
            return Response(
                {"detail": "Game is full or user is already in the game"},
                status=status.HTTP_400_BAD_REQUEST,
            )


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

        if key == "Space" and game.player_turn == player_id and not game.paused:
            print("Space key pressed")
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
        # elif key == "Escape":
        #     game.paused = not game.paused

        game.save()

        return JsonResponse({"status": "success"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def player_ready(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    user = request.user

    # Mark the player as ready
    if game.player1 == user:
        game.player1_ready = True
    elif game.player2 == user:
        game.player2_ready = True
    else:
        return Response(
            {"error": "User is not a player in this game"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    game.save()

    return Response({"status": "Player marked as ready"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_game(request, game_id):
    response, status_code = handle_leave_game(game_id, request.user)
    return Response(response, status=status_code)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def leave_loading(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.user == game.player1 or request.user == game.player2:
        game.delete()  # This line deletes the game from the database.
        return Response(
            {
                "message": "You have left the loading scene, and the game has been deleted.",
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"error": "You are not a player in this game"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def pause_game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.user.id in [game.player1_id, game.player2_id]:
        game.paused = True
        game.save()
        return Response({"status": "Game paused"}, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "User not part of this game"}, status=status.HTTP_403_FORBIDDEN
        )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def resume_game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    if request.user.id in [game.player1_id, game.player2_id]:
        game.paused = False
        game.save()
        return Response({"status": "Game resumed"}, status=status.HTTP_200_OK)
    else:
        return Response(
            {"error": "User not part of this game"}, status=status.HTTP_403_FORBIDDEN
        )


class GetCurrentGameView(generics.ListAPIView):
    serializer_class = GameSerializer

    def get_queryset(self):
        user = self.request.user
        return Game.objects.filter(
            Q(status="in_progress") | Q(status="waiting") | Q(status="pending"),
            Q(player1=user) | Q(player2=user),
        ).order_by("-start_time")[:1]
