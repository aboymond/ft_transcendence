import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { UserProfile } from '../types'; // Import the interface

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<UserProfile | null>(null);

	useEffect(() => {
		apiService
			.getUserProfile()
			.then((data: UserProfile) => setProfile(data))
			.catch((error) => console.error('Failed to load profile:', error));
	}, []);

	if (!profile) return <div>Loading profile...</div>;

	return (
		<div>
			<h1>User Profile</h1>
			<p>Username: {profile.username}</p>
			<p>Display Name: {profile.display_name}</p>
			<p>Bio: {profile.bio}</p>
			<p>Wins: {profile.wins}</p>
			<p>Losses: {profile.losses}</p>
			{/* Display other profile details */}
		</div>
	);
};

export default Profile;
