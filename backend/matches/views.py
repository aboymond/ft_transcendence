from rest_framework import generics
from .models import Match
from .serializers import MatchSerializer

class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    # def perform_create(self, serializer):
    # # Additional logic to associate a match with a tournament
    # # if needed
    # serializer.save()

class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
