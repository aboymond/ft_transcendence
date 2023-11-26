import { useState } from 'react';
import { useAuth } from '../hooks/useAuth'
import apiService from '../services/apiService';
import { ApiError } from '../types';

const AddFriend = () => {
	const [username, setUsername] = useState('');
	const { user } = useAuth();

	const handleAddFriend = async () => {
		if (user && username === user.username) {
			alert("You cannot send a friend request to yourself.");
			return;
		}
		try {
			await apiService.sendFriendRequest(username);
			alert('Friend request sent!');
		} catch (error) {
			const apiError = error as ApiError;
			if (apiError.message === 'API call failed: Bad Request') {
				alert('You cannot send a friend request to yourself.');
			} else if (apiError.message === 'API call failed: This user has already sent you a friend request.') {
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
