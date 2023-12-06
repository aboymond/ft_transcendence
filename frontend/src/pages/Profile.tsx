import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null); // Error state
	const auth = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!auth.isAuthenticated) {
			// Redirect to login page or handle unauthenticated state
			navigate('/login');
			return;
		}

		apiService
			.getUserProfile()
			.then((data: User) => {
				setProfile(data);
			})
			.catch((error) => {
				console.error('Failed to load profile:', error);
				setError('Failed to load profile');
			});
	}, [auth.isAuthenticated, navigate]);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>No profile data available.</div>;
	}

	return (
		<div>
			<h1>User Profile</h1>
			<p>Username: {profile.username}</p>
			<p>Display Name: {profile.display_name}</p>
			<p>Bio: {profile.bio}</p>
			<p>Wins: {profile.wins}</p>
			<p>Losses: {profile.losses}</p>
			<button onClick={() => navigate('/profile/update')}>
				Update Profile
			</button>
		</div>
	);
};

export default Profile;
