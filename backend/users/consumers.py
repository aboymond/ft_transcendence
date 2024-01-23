from channels.generic.websocket import AsyncWebsocketConsumer
import json


class General(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting... (General)")  # Log message before connection
        self.room_group_name = "general_requests_%s" % self.scope["user"].pk
        self.scope["user"].status = "online"
        self.scope["user"].save()

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
        self.scope["user"].status = "offline"
        self.scope["user"].save()

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
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "general_request", "message": message}
            )
            # Send a message to the WebSocket
            await self.send(text_data=json.dumps({"message": "Friend request updated"}))
        else:
            print("Error: self.channel_layer is None")

    async def user_status(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "USER_STATUS",
                    "user_id": event["user_id"],
                    "status": event["status"],
                }
            )
        )

    async def general_request(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))

    async def friend_request(self, event):
        # Handle the friend request event
        message = event["message"]

        # Send a message to the WebSocket
        await self.send(text_data=json.dumps({"message": message}))
