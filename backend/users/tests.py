from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

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
