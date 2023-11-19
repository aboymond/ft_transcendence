import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [displayName, setDisplayName] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			await apiService.register(username, password, displayName);
			console.log('Registration successful');
			setError('');
			navigate('/login');
		} catch (error) {
			console.error('Registration failed:', error);
			setError('Registration failed. Please check try again.');
		}
	};

	return (
		<div>
			<h1>Register</h1>
			{error && <p style={{ color: 'red' }}>{error}</p>}
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
