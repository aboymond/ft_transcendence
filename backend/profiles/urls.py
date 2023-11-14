from django.urls import path
from .views import ProfileView
from .views import ProfileUpdateView

urlpatterns = [
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
]
