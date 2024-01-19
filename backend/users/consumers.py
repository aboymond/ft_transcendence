from channels.generic.websocket import AsyncWebsocketConsumer
import json


class GeneralRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting... (GeneralRequestConsumer)")  # Log message before connection
        self.room_group_name = "general_requests_%s" % self.scope["user"].pk
        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        else:
            print("Error: self.channel_layer is None")
        await self.accept()
        print("Connected! (GeneralRequestConsumer)")  # Log message after connection

    async def disconnect(self, close_code):
        print("Disconnecting... (GeneralRequestConsumer)")  # Log message before connection
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
        else:
            print("Error: self.channel_layer is None")
        print("Disconnected! (GeneralRequestConsumer)")  # Log message after connection

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

    async def general_request(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))

    async def friend_request(self, event):
        # Handle the friend request event
        message = event["message"]

        # Send a message to the WebSocket
        await self.send(text_data=json.dumps({"message": message}))
