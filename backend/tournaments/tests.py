from django.test import TestCase
from django.contrib.auth.models import User
from .models import Tournament, Match
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
class TournamentModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        # Create users for participants
        cls.user1 = User.objects.create_user(username='user1', password='12345')
        cls.user2 = User.objects.create_user(username='user2', password='12345')

        # Create a tournament
        cls.tournament = Tournament.objects.create(
            name='Existing Tournament',
            start_date=timezone.now(),
            end_date=timezone.now()
        )
        cls.tournament.participants.add(cls.user1, cls.user2)

        # Create a match
        cls.match = Match.objects.create(
            player1=cls.user1,
            player2=cls.user2,
            start_time=timezone.now()
        )
        cls.tournament.matches.add(cls.match)

    def test_tournament_creation(self):
        self.assertEqual(self.tournament.name, 'Existing Tournament')
        self.assertIn(self.user1, self.tournament.participants.all())
        self.assertIn(self.match, self.tournament.matches.all())

class TournamentListViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        # Create users for participants
        cls.user1 = User.objects.create_user(username='user1', password='12345')
        cls.user2 = User.objects.create_user(username='user2', password='12345')

    def test_create_tournament(self):
        url = reverse('tournament-list')
        data = {
            'name': 'New Tournament',
            'tournament_type': Tournament.SINGLE_ELIMINATION,
            'status': 'Created',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        tournament = Tournament.objects.get(name='New Tournament')
        tournament.participants.add(self.user1, self.user2)

    def test_list_tournaments(self):
        url = reverse('tournament-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class TournamentDetailViewTest(APITestCase):

    @classmethod
    def setUpTestData(cls):
        cls.tournament = Tournament.objects.create(
            name='Existing Tournament',
            start_date=timezone.now()
        )
        cls.url = reverse('tournament-detail', kwargs={'pk': cls.tournament.pk})

    def test_get_tournament(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_tournament(self):
        data = {'name': 'Updated Tournament Name'}
        response = self.client.put(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_tournament(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

