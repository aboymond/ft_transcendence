from django.urls import path
from .views import MatchListCreateView, MatchDetailView

urlpatterns = [
    path('matches/', MatchListCreateView.as_view(), name='match-list'),
    path('matches/<int:pk>/', MatchDetailView.as_view(), name='match-detail'),
]
