from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.db.models import Q
from games.models import Game

logger = logging.getLogger(__name__)
User = get_user_model()


class GeneralRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting... (General)")
        user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.room_group_name = "general_requests_%s" % user_id
        user = await sync_to_async(User.objects.get)(pk=user_id)
        if user:
            user.status = "online"
            await sync_to_async(user.save)()
        else:
            print("Error: User not found")

        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.channel_layer.group_add("online_status", self.channel_name)
            await self.channel_layer.group_send(
                "online_status",
                {
                    "type": "user_status",
                    "user_id": user_id,
                    "status": "online",
                },
            )
        else:
            print("Error: self.channel_layer is None")
        await self.accept()
        print("Connected! (General)")  # Log message after connection

    async def disconnect(self, close_code):
        print("Disconnecting... (General)")

        user_id = self.scope["url_route"]["kwargs"]["user_id"]
        user = await sync_to_async(User.objects.get)(pk=user_id)
        if user:
            user.status = "offline"
            await sync_to_async(user.save)()
        else:
            print("Error: User not found")

        games = await self.get_active_games(user_id)
        for game_id in games:
            await self.channel_layer.group_send(
                f"game_{game_id}",
                {
                    "type": "user_disconnected",
                    "user_id": user_id,
                },
            )

        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
            await self.channel_layer.group_discard("online_status", self.channel_name)
            await self.channel_layer.group_send(
                "online_status",
                {
                    "type": "user_status",
                    "user_id": user_id,
                    "status": "offline",
                },
            )
        else:
            print("Error: self.channel_layer is None")
        print("Disconnected! (General)")  # Log message after connection

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
        print("General request message:\n", message)
        await self.send(
            text_data=json.dumps(
                {
                    "type": "general_request",
                    "payload": {"action": "general_request", "data": message},
                }
            )
        )

    @sync_to_async
    def get_active_games(self, user_id):
        # Query your Game model for active games involving the user
        games = Game.objects.filter(
            (Q(player1_id=user_id) | Q(player2_id=user_id)),
            status__in=["waiting", "in_progress"],  # Adjust based on your game statuses
        ).values_list("id", flat=True)
        return list(games)

    async def friend_request(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request", "payload": event["payload"]}
            )
        )
