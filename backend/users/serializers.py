from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework.exceptions import ValidationError
from .models import GameHistory
from .models import Friendship

User = get_user_model()


class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    match_history = GameHistorySerializer(many=True, read_only=True)
    username = serializers.CharField(
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

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
            "tournament_wins",
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

    def validate(self, data):
        if (
            "status" in data
            and data["status"] == "online"
            and not self.session_set.exists()
        ):
            raise ValidationError("User must have a current session to be online.")
        return data


class FriendshipSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    receiver = UserSerializer()

    class Meta:
        model = Friendship
        fields = ["id", "requester", "receiver", "status", "created_at"]
        read_only_fields = ["requester"]

    def validate(self, data):
        # Validate the receiver as a username instead of a primary key
        receiver_username = data.get("receiver")
        receiver = get_object_or_404(User, username=receiver_username)
        data["receiver"] = receiver
        return data


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["avatar"]
