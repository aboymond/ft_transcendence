import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [username, setUsername] = useState('');
	const [display_name, setDisplayName] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);
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
			setIsEditing(false);

			// Fetch the updated profile
			const updatedProfile = await apiService.getUserProfile();
			setProfile(updatedProfile);

			auth.updateUser(updatedProfile);
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

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

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>No profile data available.</div>;
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
						<button style={{ background: 'grey' }} onClick={() => setIsEditing(true)}>
							Update Profile
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default Profile;
