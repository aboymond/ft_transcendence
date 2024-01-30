import os
import django
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings")
django.setup()

from games.models import Game  # noqa: E402
# from games.consumers import GameConsumer

...
logger = logging.getLogger(__name__)
User = get_user_model()


class GeneralRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting... (General)")  # Log message before connection
        self.room_group_name = "general_requests_%s" % self.scope["user"].pk
        if self.scope["user"].is_authenticated:
            self.scope["user"].status = "online"
            await sync_to_async(self.scope["user"].save)()
        else:
            print("Error: self.scope['user'] is not authenticated")

        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.channel_layer.group_add("online_status", self.channel_name)
            await self.channel_layer.group_send(
                "online_status",
                {
                    "type": "user_status",
                    "user_id": self.scope["user"].id,
                    "status": "online",
                },
            )
        else:
            print("Error: self.channel_layer is None")
        await self.accept()
        print("Connected! (General)")  # Log message after connection

    async def disconnect(self, close_code):
        print("Disconnecting... (General)")  # Log message before connection
        if self.scope["user"].is_authenticated:
            self.scope["user"].status = "offline"
            await sync_to_async(self.scope["user"].save)()
        else:
            print("Error: self.scope['user'] is not authenticated")

        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            await self.channel_layer.group_discard("online_status", self.channel_name)
            await self.channel_layer.group_send(
                "online_status",
                {
                    "type": "user_status",
                    "user_id": self.scope["user"].id,
                    "status": "offline",
                },
            )
        else:
            print("Error: self.channel_layer is None")
        print("Disconnected! (General)")  # Log message after connection

    async def receive(self, text_data):
        data = json.loads(text_data)
        print("Received data", data)
        action_type = data.get("type")
        payload = data.get("payload", {})
        action = payload.get("action")
        action_data = payload.get("data")

        if action_type == "game_event" and action == "create_game":
            user_id = action_data.get("user_id")
            print("Creating game for user", user_id)
            await self.create_game(user_id)

    async def user_status(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_event",
                    "payload": {
                        "action": "user_status",
                        "data": {
                            "user_id": event["user_id"],
                            "status": event["status"],
                        },
                    },
                }
            )
        )

    async def general_request(self, event):
        message = event["message"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "general_request",
                    "payload": {"action": "general_request", "data": message},
                }
            )
        )

    async def friend_request(self, event):
        message = event["message"]
        await self.send(
            text_data=json.dumps(
                {
                    "type": "user_event",
                    "payload": {"action": "friend_request", "data": message},
                }
            )
        )

    async def create_game(self, user_id):
        user = await sync_to_async(User.objects.get)(pk=user_id)
        game = await sync_to_async(Game.create_game)(user)
        print("Game created", game.id)
        await self.send(
            text_data=json.dumps(
                {
                    "type": "game_event",
                    "payload": {
                        "action": "game_created",
                        "data": {"game_id": game.id},
                    },
                }
            )
        )
