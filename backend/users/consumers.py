from channels.generic.websocket import AsyncWebsocketConsumer
import json
import logging
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from tournaments.models import Tournament

logger = logging.getLogger(__name__)
User = get_user_model()


class GeneralRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user is None:
            print("Error: User not found")
            await self.close()
            return

        user_id = user.id
        print("Connecting... (General) # user_id:", user_id)
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
        print("Connected! (General)")

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user is None:
            print("Error: User not found")
        else:
            user_id = user.id
        print("Disconnecting... (General) # user_id:", user_id)
        user = await sync_to_async(User.objects.get)(pk=user_id)
        if user:
            user.status = "offline"
            await sync_to_async(user.save)()
        else:
            print("Error: User not found")

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
        print("Disconnected! (General)")

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
        await self.send(
            text_data=json.dumps(
                {"type": "friend_request", "payload": event["payload"]}
            )
        )

    async def tournament_message_end(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "tournament_message",
                    "payload": {
                        "action": "tournament_end",
                        "data": {
                            "tournament_id": event["tournament_id"],
                            "tournament_name": event["tournament_name"],
                            "winner_id": event["winner_id"],
                            "winner_display_name": event["winner_display_name"],
                        },
                    },
                }
            )
        )

    async def tournament_message(self, event):
        tournament_id = event["tournament_id"]
        tournament = await sync_to_async(Tournament.objects.get)(pk=tournament_id)
        winner = await sync_to_async(User.objects.get)(pk=event["winner_id"])
        await tournament.game_ended(winner)
