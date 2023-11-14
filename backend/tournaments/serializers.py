from rest_framework import serializers

from .models import PlayerProfile
from .models import Tournament
from .models import TournamentMatch
from .models import Round
from .models import MatchmakingQueue

class PlayerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerProfile
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentMatch
        fields = '__all__'  # You can also specify fields as a list of field names if you don't want to include all fields.

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'

class MatchmakingQueueSerializer(serializers.ModelSerializer):
		class Meta:
				model = MatchmakingQueue
				fields = '__all__'
