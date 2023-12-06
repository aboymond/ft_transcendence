from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import GameHistory
from .models import Friendship
from django.db.models import Q
from django.contrib.auth.models import AnonymousUser

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
    friendship_id = serializers.SerializerMethodField()

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
            "friendship_id",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            "display_name": {"required": False},
        }

    def create(self, validated_data):
        display_name = validated_data.pop("display_name", None)
        user = User.objects.create_user(  # type: ignore
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

    def get_friendship_id(self, obj):
        request = self.context.get("request")
        if request and request.user and not isinstance(request.user, AnonymousUser):
            friendship = Friendship.objects.filter(
                Q(requester=request.user, receiver=obj)
                | Q(requester=obj, receiver=request.user),
                status="accepted",
            ).first()
            return friendship.id if friendship else None  # type: ignore
        return None

    def validate_username(self, value):
        if "#" in value:
            raise serializers.ValidationError("Username cannot contain '#' character.")
        return value


class FriendshipSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    receiver = UserSerializer()

    class Meta:
        model = Friendship
        fields = ["id", "requester", "receiver", "status", "created_at"]
        read_only_fields = ["requester"]

    def to_internal_value(self, data):
        return {
            "status": data.get("status"),
        }


class AvatarSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["avatar"]
