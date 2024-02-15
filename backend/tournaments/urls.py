from django.urls import path
from .views import (
    TournamentCreateView,
    TournamentListView,
    TournamentJoinView,
    TournamentLeaveView,
    TournamentDetailView,
    TournamentMatchesListView,
)

urlpatterns = [
    path("create/", TournamentCreateView.as_view(), name="tournament-create"),
    path("list/", TournamentListView.as_view(), name="tournament-list"),
    path("<int:pk>/join/", TournamentJoinView.as_view(), name="tournament-join"),
    path("<int:pk>/leave/", TournamentLeaveView.as_view(), name="tournament-leave"),
    path("<int:id>/detail/", TournamentDetailView.as_view(), name="tournament-detail"),
    path(
        "<int:tournament_id>/matches/",
        TournamentMatchesListView.as_view(),
        name="tournament-matches",
    ),
]
