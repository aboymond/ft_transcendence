from rest_framework import generics, status
from rest_framework.response import Response
from .models import Tournament
from .serializers import TournamentSerializer


# List all tournaments or create a new one
class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer


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
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
