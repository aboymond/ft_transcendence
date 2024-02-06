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
        # await self.channel_layer.group_add("common_group", self.channel_name)

        await self.accept()
        print(
            f"WebSocket for game {self.game_id} and group {self.game_group_name} opened"
        )  # Log when WebSocket is opened

        # Check if both players are connected. This is a placeholder for your logic.
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
        # Implement game logic here
        # Update the Game model instance with the new state
        # For example:
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        game.ball_x += game.ball_velocity_x
        game.ball_y += game.ball_velocity_y
        # Check collisions, update scores, etc.
        await sync_to_async(game.save)()

        # Send updated game state to both players
        await self.send_game_state()

    async def send_game_state(self):
        game = await sync_to_async(Game.objects.get)(id=self.game_id)
        message = {
            "action": "game_state_update",
            "data": {
                "ball_x": game.ball_x,
                "ball_y": game.ball_y,
                "pad1_x": game.pad1_x,
                "pad1_y": game.pad1_y,
                "pad2_x": game.pad2_x,
                "pad2_y": game.pad2_y,
                "player1_score": game.player1_score,
                "player2_score": game.player2_score,
                "player_turn": game.player_turn,
            },
        }
        await self.send(text_data=json.dumps(message))

    async def start_periodic_update(self):
        while self.game_active:
            if not self.game_active:
                break
            print("Updating game state...")
            await self.update_game_state()
            await asyncio.sleep(5)  # TODO  Sleep for approximately 1/60th of a second
