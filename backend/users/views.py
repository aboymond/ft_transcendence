from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .serializers import FriendshipSerializer
from .models import CustomUser, GameHistory, Friendship
from .serializers import GameHistorySerializer

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer

class LoginView(generics.GenericAPIView):
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        # Add your logout logic here
        return Response(...)

class UserUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Assumes the user is updating their own profile
        return self.request.user

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
        receiver_username = self.request.data.get('receiver')
        receiver = get_object_or_404(CustomUser, username=receiver_username)
        serializer.save(requester=self.request.user, receiver=receiver)

class AcceptFriendRequestView(generics.UpdateAPIView):
    queryset = Friendship.objects.all()
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        friendship = serializer.instance
        if friendship.receiver == self.request.user and friendship.status == 'sent':
            serializer.save(status='accepted')
        else:
            return Response({"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

class ListFriendsView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Get all friends where the friendship status is 'accepted'
        friends = (User.objects.filter(sent_requests__receiver=user, sent_requests__status='accepted') |
                   User.objects.filter(received_requests__requester=user, received_requests__status='accepted'))
        return friends.distinct()

class RejectCancelFriendRequestView(generics.DestroyAPIView):
    queryset = Friendship.objects.all()
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.requester == self.request.user or instance.receiver == self.request.user:
            instance.delete()
        else:
            raise PermissionDenied("Cannot cancel or reject this friend request")

class RemoveFriendView(generics.DestroyAPIView):
    queryset = Friendship.objects.filter(status='accepted')
    permission_classes = [IsAuthenticated]

    def perform_destroy(self, instance):
        if instance.requester == self.request.user or instance.receiver == self.request.user:
            instance.delete()
        else:
            raise PermissionDenied("Cannot remove this friend")

class AvatarUploadView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
