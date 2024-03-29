import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
	const [profile, setProfile] = useState<User | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [display_name, setDisplayName] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);
	const [filename, setFilename] = useState('');
	const { user, isAuthenticated, logout, updateUser } = useAuth();
	const navigate = useNavigate();

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setAvatar(e.target.files[0]);
			setFilename(e.target.files[0].name);
		} else {
			setAvatar(null);
			setFilename('');
		}
	};

	const handleUpdate = async () => {
		try {
			const data: { display_name?: string } = {};
			if (display_name) {
				data.display_name = display_name;
				await apiService.updateUserProfile(data);
			}
			if (avatar) {
				await apiService.uploadUserAvatar(avatar);
			}

			('Profile updated successfully');
			setIsEditing(false);

			// Fetch the updated profile
			const updatedProfile = await apiService.getUserProfile();
			setProfile(updatedProfile);

			updateUser(updatedProfile);
		} catch (error) {
			if ((error as Error).message === 'Unauthorized') {
				logout();
				navigate('/');
			} else {
				console.error('Failed to fetch friends:', error);
			}
		}
	};

	const { userId } = useParams<{ userId: string }>();
	const effectiveUserId = userId || user?.id;

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/');
			return;
		}
		if (!effectiveUserId) {
			setError('User ID is undefined');
			return;
		}

		apiService
			.getUserById(effectiveUserId.toString())
			.then((data: User) => {
				setProfile(data);
			})
			.catch((error) => {
				if ((error as Error).message === 'Unauthorized') {
					logout();
					navigate('/');
				} else {
					console.error('Failed to load profile:', error);
					setError('Failed to load profile');
				}
			});
	}, [isAuthenticated, navigate, effectiveUserId, logout]);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!profile) {
		return <div>No profile data available.</div>;
	}

	return (
		<div>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				{isEditing && (
					<div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
						<label htmlFor="fileInput" className={styles.fileInput}>
							Choose File
						</label>
						<span style={{ fontSize: '10px' }}>{filename || 'No Chosen File'}</span>
						<input type="file" id="fileInput" onChange={handleAvatarChange} style={{ display: 'none' }} />
					</div>
				)}
			</div>
			{isEditing ? (
				<>
					<div className={styles.nameContainer}>
						<p style={{ marginBottom: '5px' }}>Display Name:</p>
						<input
							className={styles.input}
							type="text"
							value={display_name}
							onChange={(e) => setDisplayName(e.target.value)}
						/>
					</div>
					<div>
						<button className={styles.update} onClick={handleUpdate}>
							Update
						</button>
					</div>
				</>
			) : (
				<>
					<p>Username: {profile.username}</p>
					<p>Display Name: {profile.display_name}</p>
					<p>Wins: {profile.wins}</p>
					<p>Losses: {profile.losses}</p>
					{user && user.id === profile.id && (
						<button className={styles.update} onClick={() => setIsEditing(true)}>
							Update Profile
						</button>
					)}
				</>
			)}
		</div>
	);
};

export default Profile;
