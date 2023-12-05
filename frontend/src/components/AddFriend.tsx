import { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { ApiError } from '../types';

const AddFriend = () => {
	useEffect(() => {
		return () => {
			setUsername('');
		};
	}, []);
	const [username, setUsername] = useState('');
	const { user } = useAuth();

	const handleAddFriend = async () => {
		if (user && username === user.username) {
			alert('You cannot send a friend request to yourself.');
			return;
		}
		try {
			await apiService.sendFriendRequest(username);
			console.log('Friend request sent!');
		} catch (error: unknown) {
			const apiError = error as ApiError;
			const errorMessage = apiError.response?.data?.detail || apiError.message;
			console.log('errorMessage:', errorMessage);
			if (errorMessage === 'You cannot send a friend request to yourself.') {
				alert('You cannot send a friend request to yourself.');
			} else if (
				errorMessage === 'This user has already sent you a friend request.'
			) {
				alert('This user has already sent you a friend request.');
			} else {
				console.error('Error sending friend request:', error);
			}
		}
	};

	return (
		<div>
			<h2>Add a Friend</h2>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username"
			/>
			<button onClick={handleAddFriend}>Add Friend</button>
		</div>
	);
};

export default AddFriend;
