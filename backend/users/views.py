from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer
from .models import CustomUser
from rest_framework import generics
from .models import GameHistory
from .serializers import GameHistorySerializer
from rest_framework.permissions import IsAuthenticated

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


class GameHistoryListView(generics.ListAPIView):
    serializer_class = GameHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return GameHistory.objects.filter(players=self.request.user)