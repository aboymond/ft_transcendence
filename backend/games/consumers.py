from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Game
from asgiref.sync import sync_to_async
import asyncio


class GameConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_active = True

    async def connect(self):
        print("Connecting... (Game)")  # Log message before connection
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(self.game_group_name, self.channel_name)

        await self.accept()

        print(
            f"WebSocket for game {self.game_id} and group {self.game_group_name} opened"
        )  # Log when WebSocket is opened

        if await self.ready_to_start_game():
            await self.start_game()

        self.periodic_update_task = asyncio.create_task(self.start_periodic_update())

    async def disconnect(self, close_code):
        self.game_active = False
        if hasattr(self, "periodic_update_task"):
            await self.periodic_update_task  # Wait for the task to finish
        print("Disconnecting... (Game)")  # Log message before disconnection
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)
        print(
            f"WebSocket for game {self.game_id} and group {self.game_group_name} closed"
        )  # Log when WebSocket is closed

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Game data", data)

    async def game_message(self, event):
        # Extract the message from the event and send it to the WebSocket
        message = event["message"]
        await self.send(text_data=json.dumps(message))

    async def start_game(self):
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

        if game.ball_moving and not game.paused:
            game.ball_x += game.ball_velocity_x
            game.ball_y += game.ball_velocity_y

        await self.check_collisions(game)

        if game.ball_y < 10 or game.ball_y > game.win_height - 10:
            game.ball_moving = False
            game.ball_velocity_x = 0
            if game.ball_y < 10:
                game.player1_score += 1
                game.player_turn = 2  # TODO
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = 20
                game.ball_velocity_y *= -1
            else:
                game.player2_score += 1
                game.player_turn = 1  # TODO
                game.pad1_x = game.win_width / 2
                game.pad1_y = game.win_height - 10
                game.pad2_x = game.win_width / 2
                game.pad2_y = 10
                game.ball_x = game.win_width / 2
                game.ball_y = game.win_height - 25
                game.ball_velocity_y *= -1
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
        while self.game_active:
            if not self.game_active:
                break
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
