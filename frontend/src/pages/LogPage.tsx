import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/LogPage.module.css';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Logo from '../components/Logo';
import Login from '../components/Login';
import Register from '../components/Register';
import apiService from '../services/apiService';

const LogPage: React.FC = () => {
	const [showComponent, setShowComponent] = useState('');

	const navigate = useNavigate();
	const auth = useAuth();

	const handleClose = () => {
		setShowComponent('');
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const accessToken = urlParams.get('access_token');
		const userId = urlParams.get('user_id');
		const loginUser = async () => {
			if (accessToken && userId) {
				try {
					localStorage.setItem('token', accessToken);
					const user = await apiService.getUserById(userId);
					auth.login(accessToken, user, user.twofa);
					navigate('/home');
				} catch (error) {
					console.error('Error logging in:', error);
				}
			}
		};

		if (accessToken && userId) {
			loginUser();
		}
	}, [auth, navigate]);

	const handleApiLogin = async () => {
		const hostname = process.env.HOSTNAME || '10.13.5.4';
		window.location.href = `https://${hostname}/api/users/auth`;
	};

	return (
		<div id="page">
			<Container fluid id="log-page" className={styles.scrollableContent}>
				<Logo />
				<Row>
					<Col md="auto">
						<div id="p-end">
							<h4>It's now the end of the game!</h4>
						</div>
					</Col>
				</Row>
				<Row className="justify-content-md-center">
					<Col xs={12} md={6}>
						<Card className={styles.logCard}>
							{showComponent === '' && (
								<Card.Header className={styles.header}>Welcome to our awesome project</Card.Header>
							)}
							<Card.Body>
								{showComponent === 'login' ? (
									<Login onClose={handleClose} />
								) : showComponent === 'register' ? (
									<Register onClose={handleClose} onSuccess={() => setShowComponent('login')} />
								) : (
									<>
										<Row>
											<Col>
												<Button
													variant="primary"
													type="submit"
													className={styles.button}
													onClick={() => setShowComponent('login')}
												>
													Login
												</Button>
											</Col>
											<Col>
												<Button
													variant="primary"
													type="submit"
													className={styles.button}
													onClick={() => setShowComponent('register')}
												>
													Sign Up
												</Button>
											</Col>
										</Row>
										<Button
											variant="primary"
											type="submit"
											className={`mt-3 ${styles.button} w-100`}
											onClick={() => handleApiLogin()}
										>
											Sign In with 42
										</Button>
									</>
								)}
							</Card.Body>
							{showComponent === '' && <Card.Footer>Made with love by us</Card.Footer>}
						</Card>
					</Col>
				</Row>
			</Container>
		</div>
	);
};

export default LogPage;
