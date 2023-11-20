from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from .views import CreateUserView, LoginView, LogoutView, UserUpdateView, GameHistoryListView, CreateFriendRequestView, AcceptFriendRequestView, ListFriendsView, RejectCancelFriendRequestView, RemoveFriendView, CurrentUserProfileView, AvatarUploadView, ListFriendRequestsView

urlpatterns = [
    path('register/', CreateUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('update/', UserUpdateView.as_view(), name='update'),
    path('avatar/upload/', AvatarUploadView.as_view(), name='avatar-upload'),
    path('profile/', CurrentUserProfileView.as_view(), name='current-user-profile'),
    path('game-history/', GameHistoryListView.as_view(), name='game-history-list'),
    path('friends/request/', CreateFriendRequestView.as_view(), name='create-friend-request'),
    path('friends/requests-list/', ListFriendRequestsView.as_view(), name='list-friend-requests'),
    path('friends/accept/', AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('friends/list/', ListFriendsView.as_view(), name='list-friends'),
    path('friends/reject-cancel/<int:pk>/', RejectCancelFriendRequestView.as_view(), name='reject-cancel-friend-request'),
    path('friends/remove/<int:pk>/', RemoveFriendView.as_view(), name='remove-friend'),
]
