from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from project.consumers import GameConsumer  # Update with your consumer

application = ProtocolTypeRouter({
    'websocket': URLRouter([
        path('ws/game/', GameConsumer.as_asgi()),
    ]),
})
