from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from games.consumers import GameConsumer
from users.consumers import GeneralRequestConsumer
from tournaments.consumers import TournamentConsumer


websocket_urlpatterns = [
    path("ws/general_requests/", GeneralRequestConsumer.as_asgi()),
    path("ws/game/<int:game_id>/", GameConsumer.as_asgi()),
    path("ws/tournament/<int:tournament_id>/", TournamentConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
