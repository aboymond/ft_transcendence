# backend/project/routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from django.urls import re_path
from games.consumers import GameConsumer
from users.consumers import GeneralRequestConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/general_requests/(?P<user_id>\w+)/$",
        GeneralRequestConsumer.as_asgi(),
    ),
    path("ws/game/<int:game_id>/", GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
