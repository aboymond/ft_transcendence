import React, { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Logo from '../components/Logo';
import styles from '../styles/LogPage.module.css';
import Login from './Login';
import Register from './Register';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const LogPage: React.FC = () => {
	const [showComponent, setShowComponent] = useState('');

	const [error, setError] = useState('');
	const navigate = useNavigate();
	const auth = useAuth();

	const handleClose = () => {
		setShowComponent('');
	};

	const handleApiLogin = async (event: React.FormEvent) => {
		try {
			const data = await apiService.authlogin();
			auth.login(data.access, data.user);
			setError('');
			navigate('/profile');
		} catch (error) {
			setError('Login failed. Please check your credentials.');
		}
	};

	return (
		<Container fluid id="log-page">
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
							<Card.Header className={styles.header}>
								Welcome to our awesome project
							</Card.Header>
						)}
						<Card.Body>
							{showComponent === 'login' ? (
								<Login onClose={handleClose} />
							) : showComponent === 'register' ? (
								<Register onClose={handleClose} />
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
										Sign Up with 42
									</Button>
								</>
							)}
						</Card.Body>
						{showComponent === '' && (
							<Card.Footer>Made with love by us</Card.Footer>
						)}
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default LogPage;
