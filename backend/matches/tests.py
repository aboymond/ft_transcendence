from django.test import TestCase
from django.contrib.auth.models import User
from .models import Match
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
class MatchModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.player1 = User.objects.create_user(username='player1', password='test123')
        cls.player2 = User.objects.create_user(username='player2', password='test123')
        cls.match = Match.objects.create(
            player1=cls.player1,
            player2=cls.player2,
            start_time=timezone.now()
        )

    def test_match_creation(self):
        self.assertEqual(self.match.player1, self.player1)
        self.assertEqual(self.match.player2, self.player2)

class MatchViewTest(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.player1 = User.objects.create_user(username='player1', password='test123')
        self.player2 = User.objects.create_user(username='player2', password='test123')
        self.match = Match.objects.create(
            player1=self.player1,
            player2=self.player2,
            start_time=timezone.now()
        )
        self.url = reverse('match-list')

    def test_list_matches(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class MatchListViewTest(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='12345')
        self.user2 = User.objects.create_user(username='user2', password='12345')
        Match.objects.create(
            player1=self.user1,
            player2=self.user2,
            start_time=timezone.now()
        )

    def test_list_matches(self):
        url = reverse('match-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
