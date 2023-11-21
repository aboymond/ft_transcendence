import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
	const auth = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		auth.logout();
		navigate('/');
	};

	return (
		<nav
			style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}
		>
			{auth.isAuthenticated ? (
				<>
					<Link to="/friends" style={{ marginRight: '10px' }}>
						Friends
					</Link>
					<button onClick={handleLogout}>Logout</button>
				</>
			) : (
				<>
					<Link to="/register" style={{ marginRight: '10px' }}>
						Register
					</Link>
					<Link to="/login">Login</Link>
				</>
			)}
		</nav>
	);
};

export default Navbar;
