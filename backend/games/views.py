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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone


from .models import Game
from .serializers import GameSerializer  # GameStateSerializer

User = get_user_model()


class GameListCreateView(generics.ListCreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer


class CreateGameView(generics.CreateAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def perform_create(self, serializer):
        user_id = self.request.data.get("user_id")
        max_score = self.request.data.get("max_score")
        user = get_object_or_404(User, pk=user_id)
        serializer.save(
            player1=user,
            player2=None,
            status="waiting",
            player_turn=user.id,
            max_score=max_score,
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
            game.save()
            return Response(self.get_serializer(game).data, status=status.HTTP_200_OK)

        # If the game is full or the user is already in the game, return an error
        else:
            print("Game is full or user is already in the game")
            print(game.player1, game.player2, user)
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

        # Define the action based on the key press
        action = None
        if key == "ArrowRight":
            action = "move_right"
        elif key == "ArrowLeft":
            action = "move_left"
        elif key == "Space":
            action = "launch_ball"

        # Send a message to the GameConsumer with the action
        if action:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"game_{game_id}",
                {
                    "type": "key_action",  # This should match a method in GameConsumer
                    "player_id": player_id,
                    "action": action,
                },
            )

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
    game = get_object_or_404(Game, id=game_id)
    print("Leave game request received")
    if request.user not in [game.player1, game.player2]:
        print("User not in game")
        return Response(
            {"error": "You are not a player in this game"},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Assuming the user leaving the game is the loser
    if request.user == game.player1:
        winner = game.player2
        loser = game.player1
    else:
        winner = game.player1
        loser = game.player2

    # Update the game instance
    game.winner = winner
    game.loser = loser
    game.status = "completed"
    game.end_time = timezone.now()
    game.save()

    print("Game ended successfully")
    print(f"Winner: {winner.username}, Loser: {loser.username}")
    print("end_time:", game.end_time)

    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"game_{game_id}",
        {
            "type": "leave.game",
            "user_id": request.user.id,
            "game_id": game_id,
            "winner_id": winner.id,  # Pass the winner ID
            "loser_id": loser.id,  # Pass the loser ID
        },
    )

    return Response(
        {"message": "Leave game request processed."}, status=status.HTTP_200_OK
    )


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
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_{game_id}",
            {
                "type": "key_action",  # This should match a method in GameConsumer
                "player_id": request.user.id,
                "action": "pause",
            },
        )
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
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"game_{game_id}",
            {
                "type": "key_action",
                "player_id": request.user.id,
                "action": "resume",
            },
        )
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
