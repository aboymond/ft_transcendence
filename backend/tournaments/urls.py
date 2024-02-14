from django.urls import path
from .views import (
    TournamentCreateView,
    TournamentListView,
    TournamentJoinView,
)

urlpatterns = [
    path("create/", TournamentCreateView.as_view(), name="tournament-create"),
    path("<int:pk>/join/", TournamentJoinView.as_view(), name="tournament-join"),
    path("list/", TournamentListView.as_view(), name="tournament-list"),
]
