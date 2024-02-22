from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.db.models import Q
from .models import GameHistory
from django.contrib.auth.models import AnonymousUser
from .models import Friendship, TournamentHistory

User = get_user_model()


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


class GameHistorySerializer(serializers.ModelSerializer):
    player1 = SimpleUserSerializer(read_only=True)
    player2 = SimpleUserSerializer(read_only=True)
    winner = SimpleUserSerializer(read_only=True)

    class Meta:
        model = GameHistory
        fields = "__all__"


class TournamentHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentHistory
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    match_history = GameHistorySerializer(many=True, read_only=True)
    tournament_history_played = TournamentHistorySerializer(many=True, read_only=True)
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
            "email",
            "avatar",
            "wins",
            "losses",
            "tournament_wins",
            "status",
            "match_history",
            "friendship_id",
            "tournament_history_played",
            "twofa",
            "otp",
            "otp_expiry_time",
        )
        extra_kwargs = {
            "password": {"write_only": True},
            # "display_name": {"required": False},
        }

    def create(self, validated_data):
        # Set display_name to username
        display_name = validated_data["username"]

        # Ensure display_name is unique
        if User.objects.filter(display_name=display_name).exists():
            raise serializers.ValidationError(
                {"display_name": "This display name is already in use."}
            )

        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            display_name=display_name,  # Use username as display_name
            email=validated_data["email"],
        )
        return user

    def update(self, instance, validated_data):
        # Update display name if it's in the validated data
        instance.display_name = validated_data.get(
            "display_name", instance.display_name
        )
        instance.username = validated_data.get("username", instance.username)
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


class ListUserSerializer(serializers.ModelSerializer):
    match_history = GameHistorySerializer(many=True, read_only=True)
    tournament_history_played = TournamentHistorySerializer(many=True, read_only=True)
    
    friendship_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "display_name",
            "wins",
            "losses",
            "tournament_wins",
            "avatar",
            "status",
            "friendship_id",
            "twofa",
            "match_history",
            "tournament_history_played",
        ]
        read_only_fields = [
            "id",
            "username",
            "wins",
            "twofa",
            "losses",
            "tournament_wins",
            "status",
        ]

    def update(self, instance, validated_data):
        # Update display name if it's in the validated data
        instance.display_name = validated_data.get(
            "display_name", instance.display_name
        )
        instance.username = validated_data.get("username", instance.username)
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


class FriendshipSerializer(serializers.ModelSerializer):
    requester = ListUserSerializer(read_only=True)
    receiver = ListUserSerializer(read_only=True)

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

    def update(self, instance, validated_data):
        instance.avatar = validated_data.get("avatar", instance.avatar)
        instance.save()
        return instance
