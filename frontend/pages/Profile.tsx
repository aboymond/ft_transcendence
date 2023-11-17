// src/pages/Profile.tsx
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

const Profile: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const userId = 'user_id'; // Obtain the user ID as needed

	useEffect(() => {
		apiService
			.getUser(userId)
			.then((data) => setUser(data))
			.catch((error) => console.error('Failed to load user:', error));
	}, [userId]);

	if (!user) return <div>Loading profile...</div>;

	return (
		<div>
			<h1>User Profile</h1>
			<p>Username: {user.username}</p>
			<p>Display Name: {user.display_name}</p>
			<p>Bio: {user.bio}</p>
			{/* Display other profile details */}
			{/* Display match history */}
			{user.match_history.map((match) => (
				<div key={match.id}>
					<p>Game ID: {match.id}</p>
					<p>Played at: {new Date(match.played_at).toLocaleString()}</p>
					<p>Winner: {match.winner}</p>
					{/* Additional match details */}
				</div>
			))}
		</div>
	);
};

export default Profile;
