from rest_framework import generics
from .models import Tournament
from .serializers import TournamentSerializer
from .serializers import MatchSerializer
from .serializers import RoundSerializer
from .serializers import PlayerProfileSerializer

# List all tournaments or create a new one
class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

# Retrieve, update or delete a tournament instance
class TournamentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

from .models import TournamentMatch
from .serializers import MatchSerializer

# List all matches or create a new one
class MatchListCreateView(generics.ListCreateAPIView):
    queryset = TournamentMatch.objects.all()
    serializer_class = MatchSerializer

# Retrieve, update or delete a match instance
class MatchRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TournamentMatch.objects.all()
    serializer_class = MatchSerializer
