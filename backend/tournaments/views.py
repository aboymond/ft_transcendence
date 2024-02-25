import logging
from django.http import JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Tournament, Match
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .serializers import (
    TournamentSerializer,
    TournamentCreateSerializer,
    TournamentUpdateSerializer,
    TournamentDetailSerializer,
    MatchSerializer,
    TournamentIdSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


class TournamentCreateView(generics.CreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentCreateSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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


class TournamentLeaveView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

    def patch(self, request, *args, **kwargs):
        tournament = self.get_object()
        user = request.user
        if tournament.status == "in_progress":
            matches = Match.objects.filter(tournament=tournament).filter(
                Q(player1=user) | Q(player2=user)
            )
            for match in matches:
                if match.game and match.game.status != "completed":
                    opponent = match.player2 if match.player1 == user else match.player1
                    if opponent:
                        match.game.winner = opponent
                        match.game.loser = user
                        match.game.start_time = timezone.now()
                        match.game.end_time = timezone.now()
                        match.game.status = "completed"
                        match.game.save()
                        match.save()
                        # Send a message to the GeneralRequestConsumer to handle the game_ended logic
                        channel_layer = get_channel_layer()
                        async_to_sync(channel_layer.group_send)(
                            f"general_requests_{user.id}",
                            {
                                "type": "tournament_message",
                                "tournament_id": tournament.id,
                                "tournament_name": tournament.name,
                                "winner_id": opponent.id,
                                "winner_username": opponent.username,
                            },
                        )
                    else:
                        print("No opponent found")
        else:
            tournament.participants.remove(user)
        # Check if there are no participants left in the tournament
        if tournament.participants.count() == 0:
            tournament.delete()
            return JsonResponse(
                {"message": "Tournament deleted as there are no participants left."},
                status=status.HTTP_200_OK,
            )
        return JsonResponse(
            {"message": "Successfully left the tournament."},
            status=status.HTTP_200_OK,
        )


class TournamentListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["POST", "PUT"]:
            return TournamentUpdateSerializer
        return TournamentSerializer


class TournamentDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Tournament.objects.all()
    serializer_class = TournamentDetailSerializer
    lookup_field = "id"


class TournamentMatchesListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MatchSerializer

    def get_queryset(self):
        tournament_id = self.kwargs["tournament_id"]
        return Match.objects.filter(tournament__id=tournament_id)


class GetCurrentTournamentView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TournamentIdSerializer

    def get_queryset(self):
        user = self.request.user
        return Tournament.objects.filter(
            Q(status="in_progress") | Q(status="waiting"), participants=user
        ).order_by("-start_date")[:1]
