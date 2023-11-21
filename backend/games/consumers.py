# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'game_{self.game_id}'

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        # Process the game action data...

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_update',
                'message': data
            }
        )

    async def game_update(self, event):
        message = event['message']
        await self.send(text_data=json.dumps(message))
