import os
import requests
from django.contrib.auth import authenticate, logout
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
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
from .serializers import UserSerializer
from .serializers import FriendshipSerializer
from .models import GameHistory, Friendship
from .serializers import GameHistorySerializer
from .serializers import AvatarSerializer
from .intra import ic
import logging

User = get_user_model()
load_dotenv()
logger = logging.getLogger(__name__)


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
        else:
            raise AuthenticationFailed("Invalid Credentials")


class AuthView(generics.GenericAPIView):
    def get(self, request, *args, **kwargs):
        authorization_url = "https://api.intra.42.fr/oauth/authorize?client_id={}&redirect_uri={}&response_type=code".format(
            os.getenv("CLIENT"), "http://localhost:8000/api/users/auth/callback"
        )
        return redirect(authorization_url)

    def authorize(self):
        response = ic.get("https://api.intra.42.fr/oauth/authorize?")
        print("AUTHORIZE : ", response)


class CallBackView(APIView):
    def get(self, request, *args, **kwargs):
        response = requests.post(
            "https://api.intra.42.fr/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": os.getenv("CLIENT"),
                "client_secret": os.getenv("SECRET"),
                "code": {request.GET.get("code")},
                "redirect_uri": "http://localhost:8000/api/users/auth/callback",
            },
        )
        data = response.json()
        response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f'Bearer {data['access_token']}'},
        )
        user = {}
        user["id"] = response.json()["id"]
        user["login"] = response.json()["login"]
        user["image"] = response.json()["image"]["versions"]["small"]
        user["access_token"] = data["access_token"]
        print(user)
        # Get or create the user
        User = get_user_model()
        username = f"{user['login']}#{user['id']}"
        print(username)
        # Try to get the user from the database
        try:
            existing_user = User.objects.get(username=username)
        except User.DoesNotExist:
            # If the user does not exist, create a new user
            existing_user = User.objects.create(username=username, image=user["image"])
        else:
            # If the user exists, update their image
            existing_user.image = user["image"]
            existing_user.save()

        # Generate a JWT token for the user
        refresh = RefreshToken.for_user(existing_user)

        # Return the token in the response
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(existing_user).data,
            }
        )


class CallBackCodeView(APIView):
    def get(self, request, *args, **kwargs):
        print(f'access token : {request.GET.get('code')}')


class LogoutView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        request.user.status = "offline"
        request.user.save()
        logout(request)
        return Response(...)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

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
    serializer_class = GameHistorySerializer

    def get_queryset(self):
        user_id = self.kwargs["pk"]
        logger.info(f"Fetching game history for user {user_id}")
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"Found user {user.username} with ID {user_id}")
            return user.match_history
        except User.DoesNotExist:
            logger.error(f"User with ID {user_id} does not exist")
            return []


class CurrentUserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class GameHistoryListCreateView(generics.ListCreateAPIView):
    queryset = GameHistory.objects.all()
    serializer_class = GameHistorySerializer


class GameHistoryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GameHistory.objects.all()
    serializer_class = GameHistorySerializer


class FriendRequestCreateView(generics.CreateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

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
        serializer.save(requester=self.request.user, receiver=receiver, status="sent")

        # Send WebSocket message
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(  # type: ignore
            "friend_requests_%s" % receiver.pk,
            {
                "type": "friend_request",
                "message": "You have a new friend request from %s"
                % self.request.user.username,  # type: ignore
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
        friendship = serializer.instance
        if friendship.status == "sent":
            serializer.save(status="accepted")
        else:
            return Response(
                {"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST
            )


class ListFriendsView(generics.ListAPIView):
    serializer_class = UserSerializer
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
            instance.requester == self.request.user
            or instance.receiver == self.request.user
        ):
            instance.delete()
        else:
            raise PermissionDenied("Cannot cancel or reject this friend request")


class RemoveFriendView(generics.DestroyAPIView):
    queryset = Friendship.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if (
            instance.requester == self.request.user
            or instance.receiver == self.request.user
        ):
            instance.delete()
        else:
            raise PermissionDenied("Cannot remove this friend")


class AvatarUploadView(generics.UpdateAPIView):
    serializer_class = AvatarSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        file_serializer = AvatarSerializer(data=request.data)
        if file_serializer.is_valid():
            file_serializer.save()
            return Response(file_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(file_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
