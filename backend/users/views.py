import os
import requests
import secrets
import string
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import authenticate, logout
import logging
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.core.files.base import ContentFile
from django.db.models import Q
from django.shortcuts import redirect
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from dotenv import load_dotenv
from requests_oauthlib import OAuth2Session
from .serializers import UserSerializer
from .serializers import FriendshipSerializer
from .models import GameHistory, Friendship
from .serializers import GameHistorySerializer
from .serializers import AvatarSerializer
from .serializers import ListUserSerializer
from django.core.mail import send_mail

User = get_user_model()
load_dotenv()
logger = logging.getLogger(__name__)


class IsOwnProfileOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile, unless they are admins.
    """

    def has_object_permission(self, request, view, obj):
        return obj == request.user or request.user.is_staff


def ft_login(user):
    user.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),  # type: ignore
            "user": UserSerializer(user).data,
        },
        status=status.HTTP_200_OK,
    )


def send_otp(user):
    verification_code = generate_random_digits()
    user.otp = verification_code
    user.otp_expiry_time = timezone.now() + timedelta(hours=1)
    send_mail(
        "Verification Code",
        f"Username : {user.username}\n\nYour verification code is: {user.otp}\n\nRetroscendence Team",
        os.getenv("EMAIL_H_U"),
        [user.email],
        fail_silently=True,
    )
    user.save()


def generate_random_digits(n=6):
    return "".join(map(str, (secrets.choice(string.digits) for i in range(n))))


class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(
                serializer.data, status=status.HTTP_201_CREATED, headers=headers
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            user.status = "online"  # type: ignore
            if user.twofa is True:
                send_otp(user)
                return Response(
                    {
                        "missing_otp": True,
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                return ft_login(user)
        else:
            raise AuthenticationFailed("Invalid Credentials")


class TwoFAEnablingView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        user.twofa = request.data.get("twofa")
        user.save()

        return Response(status=status.HTTP_200_OK)


class VerifyTwoFAView(generics.UpdateAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        user = User.objects.get(username=username)
        otp = request.data.get("otp")
        if user is not None:
            if (
                user.otp == otp
                and user.otp_expiry_time is not None
                and user.otp_expiry_time > timezone.now()
            ):
                user.otp = ""
                user.otp_expiry_time = None
                user.save()

                return ft_login(user)
        raise AuthenticationFailed("Invalid Credentials")


class AuthView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        authorization_url = "https://api.intra.42.fr/oauth/authorize?client_id={}&redirect_uri={}&response_type=code".format(
            os.getenv("CLIENT"), f"{os.getenv('HOSTNAME')}/api/users/auth/callback"
        )
        return redirect(authorization_url)


class CallBackView(APIView):
    def get(self, request, *args, **kwargs):
        token_url = "https://api.intra.42.fr/oauth/token"
        client_id = os.getenv("CLIENT")
        client_secret = os.getenv("SECRET")
        redirect_uri = f"{os.getenv('HOSTNAME')}/api/users/auth/callback"
        code = request.GET.get("code")

        # Fetch access token
        response = OAuth2Session(client_id, redirect_uri=redirect_uri).fetch_token(
            token_url,
            authorization_response=request.build_absolute_uri(),
            code=code,
            client_secret=client_secret,
        )

        access_token = response.get("access_token")

        # Fetch user details
        user_url = "https://api.intra.42.fr/v2/me"
        user_response = OAuth2Session(
            client_id, token={"access_token": access_token}
        ).get(user_url)
        user_data = user_response.json()
        user = {
            "id": user_data["id"],
            "login": user_data["login"],
            "email": user_data["email"],
            "access_token": access_token,
        }

        avatar_url = user_data["image"]["versions"]["small"]
        response = requests.get(avatar_url)

        User = get_user_model()

        username = user_data["login"]
        email = user_data["email"]
        idft = user_data["id"]

        display_name = username
        if idft and not User.objects.filter(idft=idft, is_oauth_user=True).exists():
            # Check if a non-OAuth user with the same display name exists
            if (
                display_name
                and User.objects.filter(
                    display_name=display_name, is_oauth_user=False
                ).exists()
            ):
                x = 1
                display_name = username + str(x)
                while User.objects.filter(
                    display_name=display_name, is_oauth_user=False
                ).exists():
                    display_name = username + str(x + 1)

            # Create or update the user with the username and set display_name to username

            user, created = User.objects.update_or_create(
                idft=idft,
                defaults={
                    "email": email,
                    "idft": idft,
                    "is_oauth_user": True,
                    "display_name": display_name,
                    "username": display_name,
                },
            )

            if created:
                avatar_url = user_data["image"]["versions"]["small"]
                response = requests.get(avatar_url)
                user.avatar.save(f"{username}.jpg", ContentFile(response.content))
                user.save()

        user = User.objects.get(idft=idft)
        if user.twofa is True:
            send_otp(user)
            redirect_url = (
                f"{os.getenv('HOSTNAME')}" + "/verify-2fa?username=" + user.username
            )
            return redirect(redirect_url)
        else:
            refresh = RefreshToken.for_user(user)
            redirect_url = (
                f"{os.getenv('HOSTNAME')}"
                + "?access_token="
                + str(refresh.access_token)
                + "&user_id="
                + str(user.id)
            )
            return redirect(redirect_url)


class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsOwnProfileOrAdmin]

    def post(self, request, *args, **kwargs):
        request.user.status = "offline"
        request.user.save()
        logout(request)
        return Response(...)


class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = ListUserSerializer


class UserUpdateView(generics.UpdateAPIView):
    serializer_class = ListUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnProfileOrAdmin]

    def get_object(self):
        # Assumes the user is updating their own profile
        return self.request.user

    def put(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserGameHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GameHistorySerializer

    def get_queryset(self):
        user_id = self.kwargs["pk"]
        logger.info(f"Fetching game history for user {user_id}")
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"Found user {user.username} with ID {user_id}")
            # Fetch games where the user is either player1 or player2
            return GameHistory.objects.filter(Q(player1=user) | Q(player2=user))
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist")
            return []


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsOwnProfileOrAdmin]
    queryset = User.objects.all()
    serializer_class = ListUserSerializer
    lookup_field = "id"

    def get(self, request, *args, **kwargs):
        user = self.get_object()
        if request.user != user:
            return Response(
                {
                    "detail": "You do not have permission to access this user's information."
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().get(request, *args, **kwargs)


class CurrentUserProfileView(generics.RetrieveAPIView):
    serializer_class = ListUserSerializer
    permission_classes = [IsAuthenticated, IsOwnProfileOrAdmin]

    def get_object(self):
        return self.request.user


class GameHistoryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = GameHistory.objects.all()
    serializer_class = GameHistorySerializer


class GameHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = GameHistory.objects.all()
    serializer_class = GameHistorySerializer


class FriendRequestCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer

    def perform_create(self, serializer):
        receiver_username = self.request.data.get("receiver")  # type: ignore
        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            raise serializers.ValidationError("The specified user does not exist.")
        if self.request.user == receiver:
            raise serializers.ValidationError(
                "You cannot send a friend request to yourself."
            )
        if Friendship.objects.filter(
            requester=receiver, receiver=self.request.user
        ).exists():
            raise serializers.ValidationError(
                "This user has already sent you a friend request."
            )
        if Friendship.objects.filter(
            requester=self.request.user, receiver=receiver
        ).exists():
            raise serializers.ValidationError(
                "You have already sent a friend request to this user."
            )

        friendship = serializer.save(
            requester=self.request.user, receiver=receiver, status="sent"
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"general_requests_{friendship.receiver.id}",
            {
                "type": "friend_request",
                "payload": {
                    "action": "send_friend_request",
                    "data": {
                        "friendship_id": friendship.id,
                        "requester_id": friendship.requester.id,
                        "receiver_id": friendship.receiver.id,
                        "status": friendship.status,
                        "sender_name": friendship.requester.username,
                    },
                },
            },
        )

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)  # Print out the serializer errors
        try:
            return super().post(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AcceptFriendRequestView(generics.UpdateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "requestId"

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.receiver == self.request.user and instance.status == "sent":
            instance.status = "accepted"
            instance.save()

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"general_requests_{instance.requester.id}",
                {
                    "type": "friend_request",
                    "payload": {
                        "action": "accept_friend_request",
                        "data": {
                            "friendship_id": instance.id,
                            "requester_id": instance.receiver.id,
                            "receiver_id": instance.requester.id,
                            "status": instance.status,
                        },
                    },
                },
            )
        else:
            raise PermissionDenied("Cannot accept this friend request")


class ListFriendsView(generics.ListAPIView):
    serializer_class = ListUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all friends where the friendship status is 'accepted'
        friends = User.objects.filter(
            sent_requests__receiver=user, sent_requests__status="accepted"
        ) | User.objects.filter(
            received_requests__requester=user, received_requests__status="accepted"
        )
        return friends.distinct()


class ListFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Friendship.objects.filter(
            Q(requester=self.request.user) | Q(receiver=self.request.user),
            status="sent",
        )


class RejectCancelFriendRequestView(generics.DestroyAPIView):
    queryset = Friendship.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if (
            instance.requester != self.request.user
            and instance.receiver != self.request.user
        ):
            raise PermissionDenied(
                "You do not have permission to reject or cancel this friend request."
            )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"general_requests_{instance.requester_id}",  # Targeting the requester
            {
                "type": "friend_request",
                "payload": {
                    "action": "reject_friend_request",
                    "data": {
                        "friendship_id": instance.id,
                        "requester_id": self.request.user.id,
                        "receiver_id": instance.receiver.id,
                    },
                },
            },
        )

        instance.delete()


class RemoveFriendView(generics.DestroyAPIView):
    queryset = Friendship.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if (
            instance.requester == self.request.user
            or instance.receiver == self.request.user
        ):
            instance.delete()

            # Send WebSocket message
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "friend_requests",  # Group name
                {
                    "type": "friend.request",
                    "event": "Remove",
                    "requester": instance.requester.username,
                    "receiver": instance.receiver.username,
                },
            )
        else:
            raise PermissionDenied("Cannot remove this friend")


class AvatarUploadView(generics.UpdateAPIView):
    serializer_class = AvatarSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user


def put(self, request, *args, **kwargs):
    user = self.get_object()
    file_serializer = AvatarSerializer(user, data=request.data)
    if file_serializer.is_valid():
        file_serializer.save()
        return Response(file_serializer.data, status=status.HTTP_200_OK)
    else:
        return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
