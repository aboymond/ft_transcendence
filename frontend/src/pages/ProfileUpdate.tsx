import React, { useState } from 'react';
import apiService from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const ProfileUpdate: React.FC = () => {
	const [display_name, setDisplayName] = useState('');
	const [bio, setBio] = useState('');
	const [avatar, setAvatar] = useState<File | null>(null);
	const navigate = useNavigate();

	const handleUpdate = async () => {
		try {
			const data: { display_name?: string; bio?: string } = {};
			if (display_name) data.display_name = display_name;
			if (bio) data.bio = bio;
			await apiService.updateUserProfile(data);
			if (avatar) {
				await apiService.uploadUserAvatar(avatar);
			}
			alert('Profile updated successfully');
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
