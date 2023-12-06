import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const ProfileUpdate: React.FC = () => {
	const [display_name, setDisplayName] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);
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
			navigate('/profile');
		} catch (error) {
			console.error('Error updating profile:', error);
		}
	};

	return (
		<div>
			<h1>Update Profile</h1>
			<input
				type="text"
				value={display_name}
				onChange={(e) => setDisplayName(e.target.value)}
				placeholder="Display Name"
			/>
			<input type="file" onChange={handleAvatarChange} />
			<button onClick={handleUpdate}>Update</button>
		</div>
	);
};

export default ProfileUpdate;
