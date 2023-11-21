from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from project.consumers import GameConsumer

application = ProtocolTypeRouter({
    "websocket": URLRouter([
        path("ws/game/<int:game_id>/", GameConsumer.as_asgi()),
    ]),
})
