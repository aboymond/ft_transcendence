from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Game
from django.utils import timezone


def handle_leave_game(game_id, user):
    game = Game.objects.get(id=game_id)
    if game is None:
        return
    if user not in [game.player1, game.player2]:
        return {"error": "You are not a player in this game"}, 403

    # Determine the winner and loser
    if user == game.player1:
        winner = game.player2
        loser = game.player1
    else:
        winner = game.player1
        loser = game.player2

    # Update the game status, winner, and loser
    game.status = "completed"
    game.winner = winner
    game.loser = loser
    game.end_time = timezone.now()
    game.save()

    # Send a WebSocket message to notify players the game has ended
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"game_{game_id}",
        {
            "type": "leave_game",
            "message": "A player has left the game. The game has ended.",
            "winner_id": winner.id if winner else None,
            "loser_id": loser.id if loser else None,
        },
    )
    # TODOD remove this ?
    return {
        "message": "Game ended successfully",
        "winner_id": winner.id if winner else None,
        "loser_id": loser.id if loser else None,
    }, 200
