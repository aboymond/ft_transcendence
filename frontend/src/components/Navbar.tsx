import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Navbar, Nav, Container } from 'react-bootstrap';
import styles from '../styles/NavBar.module.css';

const NavBar: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        auth.logout();
        navigate('/');
    };

    return (
        <Navbar className="custom-navbar" expand="lg">
			<Container>
				{location.pathname !== '/' && <Navbar.Brand href="#">Retroscendence</Navbar.Brand>}
				<Navbar.Toggle aria-controls="basic-navbar-nav" className={styles.navToggle} />
				<Navbar.Collapse id="basic-navbar-nav">
					<Nav className={`ml-auto ${styles.nav}`}>
						<Nav.Link className={styles.navLink} href="/">Home</Nav.Link>
						{auth.isAuthenticated ? (
							<>
								<Nav.Link className={styles.navLink} href="/profile">Profile</Nav.Link>
								<Nav.Link className={styles.navLink} href="/friends">Friends</Nav.Link>
								<Nav.Link className={styles.navLink} onClick={handleLogout}>Logout</Nav.Link>
							</>
						) : (
							<>
								<Nav.Link className={styles.navLink} href="/register">Register</Nav.Link>
								<Nav.Link className={styles.navLink} href="/login">Login</Nav.Link>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default NavBar;
