import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
// import { GameHistory } from '../types';

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [username, setUsername] = useState('');
	const [display_name, setDisplayName] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);
	// const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
	const auth = useAuth();
	const navigate = useNavigate();

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setAvatar(e.target.files[0]);
		}
	};

	const handleUpdate = async () => {
		try {
			const data: { display_name?: string } = {};
			if (display_name) data.display_name = display_name;
			await apiService.updateUserProfile(data);
			if (avatar) {
				await apiService.uploadUserAvatar(avatar);
			}
			console.log('Profile updated successfully');
			setIsEditing(false); // Close the editing form after successful update

			// Fetch the updated profile
			const updatedProfile = await apiService.getUserProfile();
			setProfile(updatedProfile); // Update the profile state
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	// Fetch the profile only when auth.isAuthenticated changes
	useEffect(() => {
		if (!auth.isAuthenticated) {
			navigate('/');
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

	// Fetch the game history only when profile.id changes
	// useEffect(() => {
	// 	if (profile) {
	// 		console.log('Profile: ', profile);
	// 		apiService.getUserGameHistory(profile.id).then(setGameHistory).catch(console.error);
	// 		console.log('Game History: ', gameHistory);
	// 	}
	// }, [profile, gameHistory]);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>No profile data available.</div>;
	}

	return (
		<div>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<img src={profile.avatar} alt="User avatar" style={{ width: '100px', height: '100px' }} />
				{isEditing && <input type="file" onChange={handleAvatarChange} />}
			</div>
			{isEditing ? (
				<>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<p style={{ marginRight: '10px' }}>Username:</p>
						<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
					</div>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<p style={{ marginRight: '10px' }}>Display Name:</p>
						<input type="text" value={display_name} onChange={(e) => setDisplayName(e.target.value)} />
					</div>
					<div>
						<button onClick={handleUpdate}>Update</button>
					</div>
				</>
			) : (
				<>
					<p>Username: {profile.username}</p>
					<p>Display Name: {profile.display_name}</p>
					<p>Wins: {profile.wins}</p>
					<p>Losses: {profile.losses}</p>
					{auth.user && auth.user.id === profile.id && (
						<button onClick={() => setIsEditing(true)}>Update Profile</button>
					)}
					{/* <h2>Game History</h2>
					{gameHistory.map((game, index) => (
						<div key={index}>
							<p>Game {index + 1}:</p>
							<p>Winner: {game.winner.username}</p>
							<p>Played at: {new Date(game.played_at).toLocaleString()}</p>
							<p>Player 1 Score: {game.player1_score}</p>
							<p>Player 2 Score: {game.player2_score}</p>
						</div>
					))} */}
				</>
			)}
		</div>
	);
};

export default Profile;
