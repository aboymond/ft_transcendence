from django.urls import path
from .views import (
    TournamentCreateView,
    TournamentListView,
    TournamentJoinView,
    TournamentDetailView,
)

urlpatterns = [
    path("create/", TournamentCreateView.as_view(), name="tournament-create"),
    path("list/", TournamentListView.as_view(), name="tournament-list"),
    path("<int:pk>/join/", TournamentJoinView.as_view(), name="tournament-join"),
    path("<int:id>/detail/", TournamentDetailView.as_view(), name="tournament-detail"),
]
