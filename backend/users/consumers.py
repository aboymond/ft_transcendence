from channels.generic.websocket import AsyncWebsocketConsumer
import json


class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting...")  # Log message before connection
        self.room_group_name = "friend_requests_%s" % self.scope["user"].pk
        if self.channel_layer is not None:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        else:
            print("Error: self.channel_layer is None")
        await self.accept()
        print("Connected!")  # Log message after connection

    async def disconnect(self, close_code):
        print("Disconnecting...")  # Log message before connection
        if self.channel_layer is not None:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )
        else:
            print("Error: self.channel_layer is None")
        print("Disconnected!")  # Log message after connection

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        if self.channel_layer is not None:
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "friend_request", "message": message}
            )
        else:
            print("Error: self.channel_layer is None")

    async def friend_request(self, event):
        message = event["message"]

        await self.send(text_data=json.dumps({"message": message}))
