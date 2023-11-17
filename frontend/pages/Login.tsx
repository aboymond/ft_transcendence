// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const Login: React.FC = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const data = await apiService.login(username, password);
			console.log('Login success:', data);
			// Handle login success, store tokens, navigate to profile, etc.
			navigate('/profile');
		} catch (error) {
			console.error('Login failed:', error);
			// Handle login failure
			navigate('/profile');
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<h1>Login</h1>
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
