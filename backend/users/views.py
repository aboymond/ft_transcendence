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
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from dotenv import load_dotenv
from .serializers import UserSerializer
from .serializers import FriendshipSerializer
from .models import GameHistory, Friendship
from .serializers import GameHistorySerializer
from .serializers import AvatarSerializer
from .intra import ic
from requests_oauthlib import OAuth2Session

User = get_user_model()
load_dotenv()


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
        print("AUTH - GET")
        authorization_url = "https://api.intra.42.fr/oauth/authorize?client_id={}&redirect_uri={}&response_type=code".format(
            os.getenv("CLIENT"), "http://localhost:8000/api/users/auth/callback"
        )
        return redirect(authorization_url)

class CallBackView(APIView):
    print("CALLBACKVIEW")

    def get(self, request, *args, **kwargs):
        print("CALLBACKVIEW TEST")
        token_url = "https://api.intra.42.fr/oauth/token"
        client_id = os.getenv("CLIENT")
        client_secret = os.getenv("SECRET")
        redirect_uri = "http://localhost:8000/api/users/auth/callback"
        code = request.GET.get("code")

        # Fetch access token
        response = OAuth2Session(client_id, redirect_uri=redirect_uri).fetch_token(
            token_url, authorization_response=request.build_absolute_uri(), code=code, client_secret=client_secret
        )

        access_token = response.get('access_token')

        # Fetch user details
        user_url = "https://api.intra.42.fr/v2/me"
        user_response = OAuth2Session(client_id, token={'access_token': access_token}).get(user_url)
        user_data = user_response.json()

        user = {
            "id": user_data["id"],
            "login": user_data["login"],
            "avatar": user_data["image"]["versions"]["small"],
            "access_token": access_token,
        }

        User = get_user_model()
        username = f"{user['login']}#{user['id']}"

        try:
            existing_user = User.objects.get(username=username)
        except User.DoesNotExist:
            existing_user = User.objects.create(username=username, avatar=user["avatar"])
        else:
            existing_user.avatar = user["avatar"]
            existing_user.save()

        # temp JWT
        refresh = RefreshToken.for_user(existing_user)

        redirect_url = "http://localhost:3001?access_token=" + str(refresh.access_token)
        return redirect(redirect_url)

class CallBackCodeView(APIView):
    print("CALLBACKCODEVIEW - last")

    def get(self, request, *args, **kwargs):
        print("We're in")
        print(f'access token : {request.GET.get("code")}')
        return Response(
            {
                "test": "koukou",
            }
        )


class LogoutView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        request.user.status = "offline"
        request.user.save()
        logout(request)
        return Response(...)


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


class CreateFriendRequestView(generics.CreateAPIView):
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

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)
