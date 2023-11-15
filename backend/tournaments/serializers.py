from rest_framework import serializers

from .models import Tournament
from .models import Round
from .models import MatchmakingQueue

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'

class MatchmakingQueueSerializer(serializers.ModelSerializer):
		class Meta:
				model = MatchmakingQueue
				fields = '__all__'
