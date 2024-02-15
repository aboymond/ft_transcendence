import { useState } from 'react';
import { useEffect } from 'react';
import apiService from '../services/apiService';

const AddFriend = () => {
	useEffect(() => {
		return () => {
			setUsername('');
		};
	}, []);
	const [username, setUsername] = useState('');
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const handleAddFriend = async () => {
		try {
			await apiService.sendFriendRequest(username);
			setSuccessMessage('Friend request sent!');
		} catch (error: unknown) {
			let errorMessage = 'An unexpected error occurred';
			if (error instanceof Error) {
				const match = error.message.match(/string='(.*?)'/);
				errorMessage = match ? match[1] : error.message;
			}
			setErrorMessage(errorMessage);
		}
	};

	//TODO fix colors
	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
			<p style={{ textAlign: 'center' }}>Add friends</p>
			{successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
			{errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
				<input
					type="text"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					placeholder="Username"
					style={{
						background: 'black',
						marginRight: '10px',
						border: 'none',
						textAlign: 'center',
						borderStyle: 'solid',
						borderColor: 'var(--accent-color)',
					}}
				/>
				<button
					style={{ background: 'black', borderStyle: 'solid', borderColor: 'var(--accent-color)' }}
					onClick={handleAddFriend}
				>
					+
				</button>
			</div>
		</div>
	);
};

export default AddFriend;
