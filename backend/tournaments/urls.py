from django.urls import path
from .views import (
    TournamentListCreateView,
    TournamentRetrieveUpdateDestroyView,
    TournamentAddParticipantView,
    MatchListCreateView,
    MatchRetrieveUpdateDestroyView,
)

urlpatterns = [
    path("tournaments/", TournamentListCreateView.as_view(), name="tournament-list"),
    path(
        "tournaments/<int:pk>/",
        TournamentRetrieveUpdateDestroyView.as_view(),
        name="tournament-detail",
    ),
    path(
        "tournaments/<int:pk>/add_participant/",
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
