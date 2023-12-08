import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar, Nav, Container } from 'react-bootstrap';
import styles from '../styles/NavBar.module.css';

const NavBar: React.FC = () => {
	const auth = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		auth.logout();
		navigate('/');
	};

	return (
		<Navbar className={styles.title} expand="lg">
			<Container>
				<Navbar.Brand>{auth.user?.username || 'Retroscendence'}</Navbar.Brand>
				<Nav className="ml-auto">
					<Nav.Link onClick={handleLogout}>Logout</Nav.Link>
				</Nav>
			</Container>
		</Navbar>
	);
};

export default NavBar;
