from django.contrib.auth import authenticate, logout
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer
from .serializers import FriendshipSerializer
from .models import GameHistory, Friendship
from .serializers import GameHistorySerializer
from .serializers import AvatarSerializer

User = get_user_model()


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
            user.status = "online"
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )
        else:
            raise AuthenticationFailed("Invalid Credentials")


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


class GameHistoryListView(generics.ListAPIView):
    serializer_class = GameHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GameHistory.objects.filter(players=self.request.user)


class CreateFriendRequestView(generics.CreateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        receiver_username = self.request.data.get("receiver")
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
        serializer.save(requester=self.request.user, receiver=receiver)

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except serializers.ValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AcceptFriendRequestView(generics.UpdateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        friendship = serializer.instance
        if friendship.receiver == self.request.user and friendship.status == "sent":
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
        return Friendship.objects.filter(receiver=self.request.user, status="requested")


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
    queryset = Friendship.objects.filter(status="accepted")
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
