from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from django.urls import re_path
from project.consumers import GameConsumer
from users.consumers import FriendRequestConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/friend_requests/(?P<user_id>\w+)/$",
        FriendRequestConsumer.as_asgi(),
    ),
    path("ws/game/<int:game_id>/", GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
