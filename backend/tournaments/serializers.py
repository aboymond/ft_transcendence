from rest_framework import serializers

from .models import Tournament
from .models import Round
from .models import MatchmakingQueue
from django.contrib.auth import get_user_model

class TournamentSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=get_user_model().objects.all(),
        required=False  # Set as not required
    )
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
