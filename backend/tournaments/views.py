import logging
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Tournament, Match
from .serializers import (
    TournamentSerializer,
    TournamentCreateSerializer,
    TournamentUpdateSerializer,
    MatchSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class TournamentCreateView(generics.CreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


# List all tournaments or create a new one
class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["POST", "PUT"]:
            return TournamentUpdateSerializer
        return TournamentSerializer


# Retrieve, update or delete a tournament instance
class TournamentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer


class TournamentAddParticipantView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def patch(self, request, *args, **kwargs):
        tournament = self.get_object()
        user = request.user
        try:
            tournament.add_participant(user)
            if tournament.participants.count() == tournament.max_participants:
                if tournament.tournament_type == Tournament.SINGLE_ELIMINATION:
                    Tournament.start_single_elimination(tournament)
                elif tournament.tournament_type == Tournament.ROUND_ROBIN:
                    Tournament.start_round_robin(tournament)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer


class MatchRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
