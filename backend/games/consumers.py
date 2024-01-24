# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import Game


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.game_group_name = f"game_{self.game_id}"

        await self.channel_layer.group_add(self.game_group_name, self.channel_name)

        await self.accept()
        print(
            f"WebSocket for game {self.game_id} opened"
        )  # Log when WebSocket is opened

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.game_group_name, self.channel_name)
        print(
            f"WebSocket for game {self.game_id} closed"
        )  # Log when WebSocket is closed

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        game = Game.objects.get(id=self.game_id)
        if action == "move_pad":
            game.move_pad(data.get("pad_number"), data.get("x"))
        elif action == "key_press":
            key = data.get("key")
            player = data.get("player")
            if player == 1:
                if key == "ArrowRight":
                    game.move_pad(1, game.pad1_x + 10)  # Move pad 1 to the right
                elif key == "ArrowLeft":
                    game.move_pad(1, game.pad1_x - 10)  # Move pad 1 to the left
            elif player == 2:
                if key == "KeyD":
                    game.move_pad(2, game.pad2_x + 10)  # Move pad 2 to the right
                elif key == "KeyA":
                    game.move_pad(2, game.pad2_x - 10)  # Move pad 2 to the left
        elif action == "check_collisions":
            game.check_collisions()
        # Process other game actions...

        await self.channel_layer.group_send(
            self.game_group_name, {"type": "game_update", "message": data}
        )

        await self.channel_layer.group_send(
            self.game_group_name, {"type": "game_update", "message": data}
        )

    async def game_update(self, event):
        game = Game.objects.get(id=self.game_id)
        message = {
            "ball_x": game.ball_x,
            "ball_y": game.ball_y,
            "pad1_x": game.pad1_x,
            "pad2_x": game.pad2_x,
            # Add other game state fields...
        }
        await self.send(text_data=json.dumps(message))
