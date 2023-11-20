// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const auth = useAuth();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const data = await apiService.login(username, password);
			console.log('Login success:', data);
			auth.login(data.access);
			setError('');
			navigate('/profile');
		} catch (error) {
			console.error('Login failed:', error);
			setError('Login failed. Please check your credentials.');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>Login</h1>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
			/>
			<button type="submit">Login</button>
		</form>
	);
};

export default Login;
