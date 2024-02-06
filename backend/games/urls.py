from django.urls import path
from .views import (
    GameListCreateView,
    GameRetrieveUpdateDestroyView,
    CreateGameView,
    JoinGameView,
    KeyPressView,
)

urlpatterns = [
    path("list-create/", GameListCreateView.as_view()),
    path(
        "games/retrieve-update-destroy/<int:pk>",
        GameRetrieveUpdateDestroyView.as_view(),
        name="games-retrieve-update-destroy",
    ),
    path("create/", CreateGameView.as_view(), name="create_game"),
    path("join/<int:pk>/", JoinGameView.as_view(), name="join_game"),
    path("keypress/", KeyPressView.as_view(), name="keypress"),
]
