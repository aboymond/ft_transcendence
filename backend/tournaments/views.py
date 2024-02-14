import logging
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from django.contrib.auth import get_user_model
from .models import Tournament, Match
from .serializers import (
    TournamentSerializer,
    TournamentCreateSerializer,
    TournamentUpdateSerializer,
    TournamentDetailSerializer,
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


class TournamentJoinView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def patch(self, request, *args, **kwargs):
        tournament = self.get_object()
        user = request.user
        try:
            tournament.add_participant(user)
            if tournament.participants.count() == tournament.max_participants:
                Tournament.start_single_elimination(tournament)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# TODO: Implement the TournamentLeaveView
class TournamentLeaveView(generics.UpdateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def patch(self, request, *args, **kwargs):
        tournament = self.get_object()
        user = request.user
        # Remove the user from the tournament's participants
        tournament.participants.remove(user)
        # Check if there are no participants left in the tournament
        if tournament.participants.count() == 0:
            tournament.delete()  # Delete the tournament if no participants are left
            return JsonResponse(
                {"message": "Tournament deleted as there are no participants left."},
                status=status.HTTP_200_OK,
            )
        return JsonResponse(
            {"message": "Successfully left the tournament."},
            status=status.HTTP_200_OK,
        )


class TournamentListView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["POST", "PUT"]:
            return TournamentUpdateSerializer
        return TournamentSerializer


class TournamentDetailView(RetrieveAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentDetailSerializer
    lookup_field = "id"


class TournamentMatchesListView(generics.ListAPIView):
    serializer_class = MatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs["tournament_id"]
        return Match.objects.filter(tournament__id=tournament_id)
