from django.urls import path
from .views import (
    GameListCreateView,
    GameRetrieveUpdateDestroyView,
    CreateGameView,
    JoinGameView,
    KeyPressView,
    leave_loading,
    player_ready,
    leave_game,
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
    path("<int:game_id>/player_ready/", player_ready, name="player_ready"),
    path("<int:game_id>/leave_game/", leave_game, name="leave_game"),
    path("<int:game_id>/leave_loading/", leave_loading, name="leave_loading"),
]
