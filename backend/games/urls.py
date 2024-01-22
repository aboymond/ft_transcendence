from django.urls import path
from .views import GameListCreateView, GameRetrieveUpdateDestroyView

urlpatterns = [
    path("games/list-create", GameListCreateView.as_view(), name="games-list-create"),
    path(
        "games/retrieve-update-destroy/<int:pk>",
        GameRetrieveUpdateDestroyView.as_view(),
        name="games-retrieve-update-destroy",
    ),
]
