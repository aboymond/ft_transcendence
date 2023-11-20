import { useState } from 'react';
import apiService from '../services/apiService';

const AddFriend = () => {
	const [username, setUsername] = useState('');

	const handleAddFriend = async () => {
		try {
			await apiService.sendFriendRequest(username);
			alert('Friend request sent!');
		} catch (error) {
			console.error('Error sending friend request:', error);
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
