import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';
import { Button } from 'react-bootstrap';

interface RegisterProps {
    onClose: () => void;
}

const Register: React.FC<RegisterProps> = ({ onClose }) => {

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
		<div className={styles.container}>
			<Button 
                variant="light" 
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'var(--primary-color)',
					borderColor: 'var(--accent-color)'
                }}
            >
                &times;
            </Button>
			<h1 className={styles.title}>Register</h1>
			{error && <p style={{ color: 'red' }}>{error}</p>}
			<form onSubmit={handleSubmit}>
				<div>
					<label>Username:</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className={styles.inputField}
					/>
				</div>
				<div>
					<label>Password:</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className={styles.inputField}
					/>
				</div>
				<div>
					<label>Display Name:</label>
					<input
						type="text"
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						className={styles.inputField}
					/>
				</div>
				<button type="submit" className={styles.submitButton}>Register</button>
			</form>
		</div>
	);
};

export default Register;
