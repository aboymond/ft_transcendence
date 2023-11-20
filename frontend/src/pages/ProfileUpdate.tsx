import React, { useState } from 'react';
import apiService from '../services/apiService';

const ProfileUpdate: React.FC = () => {
	const [displayName, setDisplayName] = useState('');
	const [bio, setBio] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);

	const handleUpdate = async () => {
		try {
			const data = { displayName, bio };
			await apiService.updateUserProfile(data);
			if (avatar) {
				await apiService.uploadUserAvatar(avatar);
			}
			alert('Profile updated successfully');
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	return (
		<div>
			<h1>Update Profile</h1>
			<input
				type="text"
				value={displayName}
				onChange={(e) => setDisplayName(e.target.value)}
				placeholder="Display Name"
			/>
			<textarea
				value={bio}
				onChange={(e) => setBio(e.target.value)}
				placeholder="Bio"
			></textarea>
			<input
				type="file"
				onChange={(e) => setAvatar(e.target.files ? e.target.files[0] : null)}
			/>
			<button onClick={handleUpdate}>Update</button>
		</div>
	);
};

export default ProfileUpdate;
