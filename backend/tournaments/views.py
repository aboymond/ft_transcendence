import logging
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Tournament, Match
from .serializers import (
    TournamentSerializer,
    TournamentUpdateSerializer,
    MatchSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class TournamentCreateView(generics.CreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    logger.info("TournamentCreateView")

    def perform_create(self, serializer):
        logger.info("perform_create")
        logger.info(f"Received request data: {self.request.data}")
        creator_id = self.request.data.get("creator_id")
        creator = get_object_or_404(User, pk=creator_id)
        # Extract additional fields from the request
        name = self.request.data.get("name")
        max_participants = self.request.data.get("max_participants")
        max_score = self.request.data.get("max_score")
        # Save the tournament with all fields
        serializer.save(
            creator=creator,
            name=name,
            max_participants=max_participants,
            max_score=max_score,
        )

    # def post(self, request, *args, **kwargs):
    #     logger.info(f"Received request data: {request.data}")
    #     return super().post(request, *args, **kwargs)


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
