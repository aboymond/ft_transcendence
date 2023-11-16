from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import GameHistory, Friendship

User = get_user_model()

class UserUpdateViewTest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(username='testuser', password='testpassword123', display_name='OriginalName')
        self.url = reverse('update')

        # Obtain a JWT token for the test user
        response = self.client.post('/api/users/token/', {'username': 'testuser', 'password': 'testpassword123'})
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_update_display_name(self):
        # Data to update
        data = {
            'display_name': 'UpdatedName'
        }

        response = self.client.patch(self.url, data)

        # Refresh user data from the database
        self.user.refresh_from_db()

        # Check that the response status code is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that the display name was updated
        self.assertEqual(self.user.display_name, 'UpdatedName')

    def test_unauthenticated_user(self):
        # Remove token to simulate an unauthenticated user
        self.client.credentials()

        # Attempt to update user data
        response = self.client.patch(self.url, {'display_name': 'NewName'})

        # Check that the response status code is 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class GameHistoryTest(TestCase):
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(username='user1', password='password123')
        self.user2 = User.objects.create_user(username='user2', password='password123')
        
        # Create a game history instance
        self.game_history = GameHistory.objects.create(winner=self.user1)
        self.game_history.players.add(self.user1, self.user2)

        # Set up the API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user1)

    def test_retrieve_game_history(self):
        # Get the URL for retrieving game history
        url = reverse('game-history-list')

        # Make the request
        response = self.client.get(url)

        # Test that the response is 200 OK
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test that the response contains the game history
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['winner'], self.user1.id)

class FriendshipTests(TestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='test123')
        self.user2 = User.objects.create_user(username='user2', password='test123')
        self.user3 = User.objects.create_user(username='user3', password='test123')
        Friendship.objects.create(requester=self.user1, receiver=self.user2, status='accepted')
        Friendship.objects.create(requester=self.user2, receiver=self.user3, status='sent')
        self.client = APIClient()

    def test_list_friends(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse('list-friends'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # user1 should have 1 friend

    def test_reject_friend_request(self):
        self.client.force_authenticate(user=self.user3)
        friendship = Friendship.objects.get(requester=self.user2, receiver=self.user3)
        url = reverse('reject-cancel-friend-request', kwargs={'pk': friendship.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Friendship.objects.filter(pk=friendship.id).exists())

    def test_remove_friend(self):
        self.client.force_authenticate(user=self.user1)
        friendship = Friendship.objects.get(requester=self.user1, receiver=self.user2, status='accepted')
        url = reverse('remove-friend', kwargs={'pk': friendship.id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Friendship.objects.filter(pk=friendship.id).exists())

    # Add more tests as needed for other scenarios and edge cases

