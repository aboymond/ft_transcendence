from django.urls import path
from .views import (
    TournamentCreateView,
    TournamentListCreateView,
    TournamentRetrieveUpdateDestroyView,
    TournamentAddParticipantView,
    MatchListCreateView,
    MatchRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("create/", TournamentCreateView.as_view(), name="tournament-create"),
    path("list/", TournamentListCreateView.as_view(), name="tournament-list"),
    path(
        "<int:pk>/",
        TournamentRetrieveUpdateDestroyView.as_view(),
        name="tournament-detail",
    ),
    path(
        "<int:pk>/add_participant/",
        TournamentAddParticipantView.as_view(),
        name="tournament-add-participant",
    ),
    path("matches/", MatchListCreateView.as_view(), name="match-list"),
    path(
        "matches/<int:pk>/",
        MatchRetrieveUpdateDestroyView.as_view(),
        name="match-detail",
    ),
]
