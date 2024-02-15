import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/Login.module.css';
import { Button } from 'react-bootstrap';

interface LoginProps {
    onClose: () => void;
}

const LogApi: React.FC<LoginProps> = ({ onClose }) => {

	const [error, setError] = useState('');
	const navigate = useNavigate();
	const auth = useAuth();

	const handleApiLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		try {
			const data = await apiService.login(username, password, data.user.twofa);
			auth.login(data.access, data.user, data.user.twofa);
			setError('');
			navigate('/profile');
		} catch (error) {
			setError('Login failed. Please check your credentials.');
		}
	};

	return (
	<button type="submit" className={styles.submitButton}>Login</button>
	);
};

export default LogApi;