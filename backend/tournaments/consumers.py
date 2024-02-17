from channels.generic.websocket import AsyncWebsocketConsumer
import json


class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
        self.tournament_group_name = f"tournament_{self.tournament_id}"

        # Join tournament group
        await self.channel_layer.group_add(
            self.tournament_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave tournament group
        await self.channel_layer.group_discard(
            self.tournament_group_name, self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Send message to tournament group
        await self.channel_layer.group_send(
            self.tournament_group_name,
            {"type": "tournament_message", "message": message},
        )

    # Receive message from tournament group
    async def tournament_message(self, event):
        message = event["message"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"message": message}))
