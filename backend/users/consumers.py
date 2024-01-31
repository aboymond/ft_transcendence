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
        print("General data:\n", data)
        action_type = data.get("type")
        payload = data.get("payload", {})
        action = payload.get("action")
        action_data = payload.get("data")

        if action_type == "game_event" and action == "create_game":
            user_id = action_data.get("user_id")
            print("Creating game for user:", user_id)
            await self.create_game(user_id)

        if action == "join_game":
            await self.join_game(data)

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

    async def friend_request(self, event):
        message = event["message"]
        print("Friend request message:\n", message)
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
        game = await sync_to_async(Game.objects.create)(
            player1=user, player2=None, status="waiting"
        )
        # After the game is created, form the group name using the game id
        group_name = f"game_{game.id}"
        # Then add the game creator's channel to the game's group
        await self.channel_layer.group_add(
            group_name,  # The game's group name
            self.channel_name,  # The game creator's channel name
        )
        logger.info(f"Added channel {self.channel_name} to group {group_name}")
        print("Game created:", game.id)
        message = json.dumps(
            {
                "type": "game_event",
                "payload": {
                    "action": "game_created",
                    "data": {"game_id": game.id},
                },
            }
        )
        print("Sending message:\n", message)
        await self.send(text_data=message)

    async def join_game(self, data):
        game_id = data["payload"]["data"]["game_id"]
        user_id = data["payload"]["data"]["user_id"]
        game = await sync_to_async(Game.objects.get)(id=game_id)
        user = await sync_to_async(User.objects.get)(id=user_id)

        # Check if the game is full
        is_full = await game.is_full()
        if not is_full:
            game.player2 = user
            game.status = "in_progress"
            await sync_to_async(game.save)()

            # Add the joining user's channel to the game's group
            await self.channel_layer.group_add(
                f"game_{game.id}",  # The game's group name
                self.channel_name,  # The joining user's channel name
            )
            print("Sending start_game to both users")
            # Send the 'start_game' message to the game's group
            await self.channel_layer.group_send(
                f"game_{game.id}",  # The game's group name
                {
                    "type": "game_event",
                    "payload": {
                        "action": "start_game",
                        "data": {
                            "game_id": game.id,
                        },
                    },
                },
            )
            logger.info(f"Sent start_game message to group game_{game.id}")
        else:
            print("Error: The game is already full")
            # Optionally, send a message back to the user attempting to join the full game
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "game_error",
                        "payload": {
                            "action": "join_game",
                            "data": {
                                "error": "The game is already full",
                            },
                        },
                    }
                )
            )

    async def game_event(self, event):
        # Handle the game_event message here
        print("Game event:\n", event)
