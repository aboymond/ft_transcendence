import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/LogPage.module.css';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Logo from '../components/Logo';
import Login from '../components/Login';
import Register from '../components/Register';

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

		if (accessToken && userId) {
			auth.login(accessToken); //TODO
			navigate('/home');
		}
	}, [auth, navigate]);

	const handleApiLogin = async () => {
		window.location.href = 'http://localhost:8000/api/users/auth';
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
