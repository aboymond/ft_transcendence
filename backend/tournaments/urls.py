from django.urls import path
from .views import (
    TournamentListCreateView,
    TournamentRetrieveUpdateDestroyView,
    TournamentAddParticipantView,
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
]
