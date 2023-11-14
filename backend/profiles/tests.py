from django.test import TestCase
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model

User = get_user_model()

class ProfileModelTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Create a user and profile for testing
        cls.user = User.objects.create_user(username='testuser', password='12345')
        cls.profile = cls.user.profile  # Use the auto-created profile
        cls.profile.bio = 'Initial bio'
        cls.profile.save()

    def test_update_bio(self):
        # Test updating the bio
        self.profile.update_bio('Updated bio')
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.bio, 'Updated bio')

    # Add more tests for other aspects of the Profile model

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class ProfileViewTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Create a user for testing
        cls.user = User.objects.create_user(username='testuser2', password='12345')

    def setUp(self):
        # Authenticate the test client with the created user
        self.client.force_authenticate(user=self.user)

    def test_get_profile(self):
        # Test retrieving a profile
        self.client.login(username='testuser2', password='12345')
        url = reverse('profile-detail')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_update_profile(self):
        # Test updating a profile
        self.client.login(username='testuser2', password='12345')
        url = reverse('profile-update')
        data = {'bio': 'New bio'}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # Add more tests for other views and scenarios
