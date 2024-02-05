from django.urls import path
from .views import GameListCreateView, GameRetrieveUpdateDestroyView

urlpatterns = [
    path("list-create/", GameListCreateView.as_view()),
    path(
        "games/retrieve-update-destroy/<int:pk>",
        GameRetrieveUpdateDestroyView.as_view(),
        name="games-retrieve-update-destroy",
    ),
]
