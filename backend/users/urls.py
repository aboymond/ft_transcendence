from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    CreateUserView,
    LoginView,
    AuthView,
    CallBackView,
    CallBackCodeView,
    LogoutView,
    UserListView,
    UserUpdateView,
    CurrentUserProfileView,
    GameHistoryListCreateView,
    GameHistoryRetrieveUpdateDestroyView,
    UserGameHistoryView,
    FriendRequestCreateView,
    AcceptFriendRequestView,
    ListFriendsView,
    ListFriendRequestsView,
    RejectCancelFriendRequestView,
    RemoveFriendView,
    AvatarUploadView,
    UserDetailView,
    TwoFAEnablingView,
    VerifyTwoFAView,
)

urlpatterns = [
    path("register/", CreateUserView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("auth/", AuthView.as_view(), name="auth"),
    path("auth/callback", CallBackView.as_view(), name="callback"),
    path("auth/callback/code", CallBackCodeView.as_view(), name="callback_code"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("list/", UserListView.as_view(), name="user-list"),
    path("update/", UserUpdateView.as_view(), name="update"),
    path("avatar/upload/", AvatarUploadView.as_view(), name="avatar-upload"),
    path('<int:id>/', UserDetailView.as_view(), name='user-detail'),
    path("profile/", CurrentUserProfileView.as_view(), name="current-user-profile"),
    path("twofa/", TwoFAEnablingView.as_view(), name="twofa"),
    path("/verify-2fa/", VerifyTwoFAView.as_view(), name="verify_2fa"),
    path("game_histories/", GameHistoryListCreateView.as_view(), name="game_histories"),
    path(
        "game_histories/<int:pk>/",
        GameHistoryRetrieveUpdateDestroyView.as_view(),
        name="retrieve_game_histories",
    ),
    path(
        "<int:pk>/game_history/",
        UserGameHistoryView.as_view(),
        name="user-game-history",
    ),
    path(
        "friends/request/",
        FriendRequestCreateView.as_view(),
        name="create-friend-request",
    ),
    path(
        "friends/requests-list/",
        ListFriendRequestsView.as_view(),
        name="list-friend-requests",
    ),
    path(
        "friends/request-accept/<int:requestId>/",
        AcceptFriendRequestView.as_view(),
        name="accept-friend-request",
    ),
    path(
        "friends/request-reject-cancel/<int:pk>/",
        RejectCancelFriendRequestView.as_view(),
        name="reject-cancel-friend-request",
    ),
    path("friends/remove/<int:pk>/", RemoveFriendView.as_view(), name="remove-friend"),
    path("friends/list/", ListFriendsView.as_view(), name="list-friends"),
]
