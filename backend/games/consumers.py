from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Game
from asgiref.sync import sync_to_async
import asyncio
from channels.db import database_sync_to_async
from .utils import handle_leave_game
from django.contrib.auth import get_user_model
from websockets.exceptions import ConnectionClosedOK
from django.utils import timezone
import time
from tournaments.models import Tournament

User = get_user_model()


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.update_task = None

    async def connect(self):
        print("Connecting... (Game)")
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()

        if await self.ready_to_start_game():
            await self.start_game()

    async def disconnect(self, close_code):
        print("Disconnecting... (Game)")
        if self.update_task:
            print("Cancelling periodic update...")
            self.update_task.cancel()
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)

    async def ready_to_start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        player1 = await sync_to_async(getattr)(game, "player1_ready", False)
        player2 = await sync_to_async(getattr)(game, "player2_ready", False)
        return player1 and player2

    async def start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        game.start_time = timezone.now()
        game.status = "in_progress"
        game.pad1_x = game.win_width / 2
        game.pad1_y = game.win_height - 10
        game.pad2_x = game.win_width / 2
        game.pad2_y = 10
        game.ball_x = game.win_width / 2
        game.ball_y = game.pad1_y - 20
        await sync_to_async(game.save)()

        message = {
            "action": "start_game",
            "data": {
                "message": "Game has started",
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",  # This should match a method in your consumer that handles this message
                "message": message,
            },
        )
        print("Starting periodic update...")
        self.update_task = asyncio.create_task(self._periodic_update())

    async def _periodic_update(self):
        while True:
            start_time = time.time()
            await self.update_game_state()
            await self.send_game_state()
            end_time = time.time()
            elapsed_time = (end_time - start_time) * 1000  # Convert to milliseconds
            sleep_time = max(
                16 - elapsed_time, 0
            )  # Ensure at least 16ms between updates
            await asyncio.sleep(
                sleep_time / 1000
            )  # Convert milliseconds to seconds for sleep

    async def update_game_state(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if game is not None:
            player1_id = game.player1_id
            player2_id = game.player2_id
            if player1_id is None or player2_id is None:
                return

        if not game.ball_moving and not game.paused:
            await self.check_turn()
            await self.send_game_state()
            return

        if game.ball_moving and not game.paused:
            game.ball_x += game.ball_velocity_x
            game.ball_y += game.ball_velocity_y
            await self.check_collisions(game)
            await self.check_score(game)

        await sync_to_async(game.save)()
        # await self.send_game_state()

    async def send_game_state(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if game is None or game.paused or game.status != "in_progress":
            return
        message = {
            "action": "game_state_update",
            "data": {
                "ball_x": game.ball_x,
                "ball_y": game.ball_y,
                "player1_score": game.player1_score,
                "player2_score": game.player2_score,
                "pad1_x": game.pad1_x,
                "pad1_y": game.pad1_y,
                "pad2_x": game.pad2_x,
                "pad2_y": game.pad2_y,
                "player_turn": game.player_turn,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def check_turn(self):
        game = await database_sync_to_async(Game.objects.get)(id=self.game_id)
        if game is None:
            return

        PAD_WIDTH = game.pad_width
        BALL_SIZE = game.ball_width

        if game.player_turn == game.player1_id:
            # Adjust ball position relative to pad1
            if game.ball_x - BALL_SIZE / 2 < game.pad1_x - PAD_WIDTH / 2:
                game.ball_x = game.pad1_x - PAD_WIDTH / 2 + BALL_SIZE / 2
            elif game.ball_x + BALL_SIZE / 2 > game.pad1_x + PAD_WIDTH / 2:
                game.ball_x = game.pad1_x + PAD_WIDTH / 2 - BALL_SIZE / 2

            # Calculate ball velocity based on position relative to pad
            game.ball_velocity_x = ((game.ball_x - game.pad1_x) / (PAD_WIDTH / 2)) * 5
        elif game.player_turn == game.player2_id:
            # Adjust ball position relative to pad2
            if game.ball_x - BALL_SIZE / 2 < game.pad2_x - PAD_WIDTH / 2:
                game.ball_x = game.pad2_x - PAD_WIDTH / 2 + BALL_SIZE / 2
            elif game.ball_x + BALL_SIZE / 2 > game.pad2_x + PAD_WIDTH / 2:
                game.ball_x = game.pad2_x + PAD_WIDTH / 2 - BALL_SIZE / 2

            # Calculate ball velocity based on position relative to pad
            game.ball_velocity_x = ((game.ball_x - game.pad2_x) / (PAD_WIDTH / 2)) * 5

        # Save the updated game state
        await database_sync_to_async(game.save)()

    async def check_collisions(self, game):
        # Wall collision
        if game.ball_x <= 1 or game.ball_x + game.ball_width / 2 >= game.win_width - 1:
            game.ball_velocity_x = -game.ball_velocity_x

        # Pad 2 collision
        if (
            game.pad2_x - game.pad_width / 2
            < game.ball_x
            < game.pad2_x + game.pad_width / 2
        ):
            if game.ball_y <= game.pad2_y + game.pad_height / 2 + 1:
                game.ball_velocity_y = -game.ball_velocity_y
                game.ball_velocity_x = (
                    (game.ball_x - game.pad2_x) / (game.pad_width / 2)
                ) * 5

        # Pad 1 collision
        if (
            game.pad1_x - game.pad_width / 2
            < game.ball_x
            < game.pad1_x + game.pad_width / 2
        ):
            if game.ball_y >= game.pad1_y - game.pad_height - 1:
                game.ball_velocity_x = (
                    (game.ball_x - game.pad1_x) / (game.pad_width / 2)
                ) * 5
                game.ball_velocity_y = -game.ball_velocity_y

    async def check_score(self, game):
        player1_id = game.player1_id
        player2_id = game.player2_id

        if game.ball_y < 1 or game.ball_y > game.win_height - 1:
            game.ball_moving = False
            game.ball_velocity_x = 0

            if game.ball_y < 1:
                game.player1_score += 1
                game.player_turn = player2_id
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = game.pad2_y + 20
                game.ball_velocity_y *= -1
            else:
                game.player2_score += 1
                game.player_turn = player1_id
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = game.pad1_y - 20
                game.ball_velocity_y *= -1
            if (
                game.player1_score >= game.max_score
                or game.player2_score >= game.max_score
            ):
                await self.end_game(game)

    async def game_message(self, event):
        message = event["message"]
        try:
            await self.send(text_data=json.dumps(message))
        except ConnectionClosedOK:
            print("Attempted to send a message to a closed WebSocket connection.")

    async def leave_game(self, event):
        winner_id = event["winner_id"]
        loser_id = event["loser_id"]

        winner = await database_sync_to_async(User.objects.get)(id=winner_id)
        loser = await database_sync_to_async(User.objects.get)(id=loser_id)
        winner.wins += 1
        await database_sync_to_async(winner.save)()
        loser.losses += 1
        await database_sync_to_async(loser.save)()

        message = {
            "action": "leave_game",
            "data": {
                "message": "A player has left the game. The game has ended.",
                "winner_id": winner_id,
                "loser_id": loser_id,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    async def user_disconnected(self, event):
        user_id = event["user_id"]
        user = await self.get_user(user_id)
        await database_sync_to_async(handle_leave_game)(self.game_id, user)

    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)

    async def end_game(self, game):
        game.status = "completed"
        game.winner = await sync_to_async(self.determine_winner)(game)
        game.loser = await sync_to_async(self.determine_loser)(game)
        game.end_time = timezone.now()
        await sync_to_async(game.save)()

        game.winner.wins += 1
        await sync_to_async(game.winner.save)()
        game.loser.losses += 1
        await sync_to_async(game.loser.save)()

        print("Game ended")
        print("Game ID:", game.id)
        print("tournament_id:", game.tournament_id)
        # Check if the game is part of a tournament and call create_matches_for_round
        if game.tournament_id is not None:
            tournament = await database_sync_to_async(Tournament.objects.get)(
                id=game.tournament_id
            )
            winner = [game.winner]
            print("Winner:", winner)
            round_number = await database_sync_to_async(
                Tournament.get_next_round_number
            )(tournament)
            print("Round number:", round_number)
            await database_sync_to_async(Tournament.create_matches_for_round)(
                tournament, winner, round_number
            )

        message = {
            "action": "end_game",
            "data": {
                "message": "The game has ended.",
                "winner_id": game.winner.id if game.winner else None,
                "loser_id": game.loser.id if game.loser else None,
            },
        }
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                "type": "game_message",
                "message": message,
            },
        )

    def determine_winner(self, game):
        return game.player1 if game.player1_score >= game.max_score else game.player2

    def determine_loser(self, game):
        return game.player2 if game.player1_score >= game.max_score else game.player1
