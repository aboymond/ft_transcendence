import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [displayName, setDisplayName] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			await apiService.register(username, password, displayName);
			console.log('Registration successful');
			navigate('/login'); // Redirect to login page after successful registration
		} catch (error) {
			console.error('Registration failed:', error);
			// Handle registration failure
		}
	};

	return (
		<div>
			<h1>Register</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Username:</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</div>
				<div>
					<label>Password:</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<div>
					<label>Display Name:</label>
					<input
						type="text"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
					/>
				</div>
				<button type="submit">Register</button>
			</form>
		</div>
	);
};

export default Register;
