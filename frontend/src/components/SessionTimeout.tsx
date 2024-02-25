import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { DecodedToken } from '../types';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SessionTimeout: React.FC = () => {
	const { token, logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		const sessionTimeout = setTimeout(() => {
			if (token) {
				const decodedToken: DecodedToken = jwtDecode(token);
				const currentTime = Date.now() / 1000;

				if (decodedToken.exp < currentTime) {
					logout();
					navigate('/');
					toast.error('Session timed out. Please log in again.');
				}
			}
		}, 600000); // 10 minutes in milliseconds

		return () => clearTimeout(sessionTimeout);
	}, [token, logout, navigate]);

	return null;
};

export default SessionTimeout;
