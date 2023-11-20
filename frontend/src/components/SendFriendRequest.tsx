import { useState } from 'react';
import apiService from '../services/apiService';

const SendFriendRequest = () => {
	const [username, setUsername] = useState('');

	const handleSendRequest = async () => {
		try {
			await apiService.sendFriendRequest(username);
			alert('Friend request sent!');
			setUsername(''); // Reset the input field
		} catch (error) {
			console.error('Failed to send friend request:', error);
		}
	};

	return (
		<div>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Enter username"
			/>
			<button onClick={handleSendRequest}>Send Request</button>
		</div>
	);
};

export default SendFriendRequest;
