from django.urls import path
from .views import ProfileDetailView, ProfileUpdateView, ProfileDeleteView

urlpatterns = [
    path('profile/detail/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profile/update/', ProfileUpdateView.as_view(), name='profile-update'),
    path('profile/delete/', ProfileDeleteView.as_view(), name='profile-delete'),
]
