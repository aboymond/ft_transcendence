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

User = get_user_model()


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_active = False
        self.update_task = None

    async def connect(self):
        print("Connecting... (Game)")  # Log message before connection
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"
        await self.channel_layer.group_add(self.game_group_name, self.channel_name)
        await self.accept()
        print(f"WebSocket game {self.game_id} and group {self.game_group_name} opened")

        await self.start_periodic_update()

        if await self.ready_to_start_game():
            await self.start_game()

    async def disconnect(self, close_code):
        print("Disconnecting... (Game)")  # Log message before disconnection
        self.game_active = False
        if self.update_task:
            self.update_task.cancel()  # Cancel the periodic update task
            try:
                await self.update_task
            except asyncio.CancelledError:
                pass  # Task cancellation is expected, so we can safely ignore this exception
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)
        print(f"WebSocket game {self.game_id} and group {self.game_group_name} closed")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Game data", data)

    async def game_message(self, event):
        message = event["message"]
        try:
            await self.send(text_data=json.dumps(message))
        except ConnectionClosedOK:
            print("Attempted to send a message to a closed WebSocket connection.")

    async def start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        game.start_time = timezone.now()
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

    async def ready_to_start_game(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        player1 = await sync_to_async(getattr)(game, "player1", None)
        player2 = await sync_to_async(getattr)(game, "player2", None)
        return player1 is not None and player2 is not None

    async def update_game_state(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        if game is not None:
            player1_id = game.player1_id
            player2_id = game.player2_id
            if player1_id is None or player2_id is None:
                return

        if game.ball_moving and not game.paused:
            game.ball_x += game.ball_velocity_x
            game.ball_y += game.ball_velocity_y

        await self.check_collisions(game)

        if game.ball_y < 10 or game.ball_y > game.win_height - 10:
            game.ball_moving = False
            game.ball_velocity_x = 0
            if game.ball_y < 10:
                game.player1_score += 1
                game.player_turn = player2_id
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = 20
                game.ball_velocity_y *= -1
            else:
                game.player2_score += 1
                game.player_turn = player1_id
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = game.win_height - 25
                game.ball_velocity_y *= -1
            if (
                game.player1_score >= game.max_score
                or game.player2_score >= game.max_score
            ):
                await self.game_ended(game)

        await sync_to_async(game.save)()
        await self.send_game_state()

    async def send_game_state(self):
        if not self.game_active:  # Check if the game is still active
            return  # Exit the method if the game is not active
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
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
        await self.send(text_data=json.dumps(message))

    async def start_periodic_update(self):
        self.game_active = True
        self.update_task = asyncio.create_task(self._periodic_update())

    async def _periodic_update(self):
        while self.game_active:
            await self.update_game_state()
            await asyncio.sleep(1 / 60)

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

    async def start_game_updates(self, event):
        print("Starting game updates")
        self.game_active = True
        await self.start_periodic_update()

    async def leave_game(self, event):
        winner_id = event["winner_id"]
        loser_id = event["loser_id"]

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
                "type": "game_message",  # This should match a method in your consumer that handles this message
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

    async def game_ended(self, game):
        # Wrap the synchronous operations with sync_to_async
        game.status = "completed"
        game.winner = await sync_to_async(self.determine_winner)(game)
        game.loser = await sync_to_async(self.determine_loser)(game)
        game.end_time = timezone.now()
        await sync_to_async(game.save)()

        message = {
            "action": "game_ended",
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
