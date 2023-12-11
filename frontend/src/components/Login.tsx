import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.module.css';
import { Button } from 'react-bootstrap';

interface LoginProps {
	onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();
	const auth = useAuth();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const data = await apiService.login(username, password);
			auth.login(data.access, data.user);
			setError('');
			navigate('/home');
		} catch (error) {
			setError('Login failed. Please check your credentials.');
		}
	};

	return (
		<form onSubmit={handleSubmit} className={styles.loginForm}>
			<Button
				variant="light"
				onClick={onClose}
				style={{
					position: 'absolute',
					top: 10,
					right: 10,
					backgroundColor: 'var(--primary-color)',
					borderColor: 'var(--accent-color)',
					width: 'auto',
				}}
			>
				&times;
			</Button>
			<h1 className={styles.title}>Login</h1>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
				className={styles.inputField}
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
				className={styles.inputField}
			/>
			<button type="submit" className={styles.submitButton}>
				Login
			</button>
		</form>
	);
};

export default Login;
