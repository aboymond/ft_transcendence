from rest_framework import generics
from .models import Tournament
from .serializers import TournamentSerializer
from .serializers import RoundSerializer

# List all tournaments or create a new one
class TournamentListCreateView(generics.ListCreateAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer

# Retrieve, update or delete a tournament instance
class TournamentRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
