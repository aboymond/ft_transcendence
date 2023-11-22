from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import GameHistory
from .models import Friendship

User = get_user_model()


class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = ["id", "players", "winner", "played_at"]


class UserSerializer(serializers.ModelSerializer):
    match_history = GameHistorySerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "password",
            "display_name",
            "avatar",
            "bio",
            "wins",
            "losses",
            "status",
            "match_history",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "display_name": {"required": False},
        }

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", None)
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            display_name=display_name,
        )
        return user

    def update(self, instance, validated_data):
        # Update display name if it's in the validated data
        instance.display_name = validated_data.get(
            "display_name", instance.display_name
        )

        # Update password if it's in the validated data and not empty
        password = validated_data.get("password")
        if password:
            instance.set_password(password)

        # Save the instance with updated fields
        instance.save()

        return instance


class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ["id", "requester", "receiver", "status", "created_at"]


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["avatar"]
