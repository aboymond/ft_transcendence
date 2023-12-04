import React, { useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Logo from '../components/Logo';
import styles from '../styles/LogPage.module.css';
import Login from './Login';
import Register from './Register'; // Import the Register component

const LogPage: React.FC = () => {
    const [showComponent, setShowComponent] = useState(''); // Add a new state variable for the Register component

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
                        <Card.Body>
                            {showComponent === 'login' ? <Login /> : showComponent === 'register' ? <Register /> : (
                                <>
                                    <Row>
                                        <Col>
                                            <Button variant="primary" type="submit" className={styles.button} onClick={() => setShowComponent('login')}>
                                                Login
                                            </Button>
                                        </Col>
                                        <Col>
                                            <Button variant="primary" type="submit" className={styles.button} onClick={() => setShowComponent('register')}>
                                                Sign Up
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Button variant="primary" type="submit" className={`mt-3 ${styles.button} w-100`}>
                                        Sign Up with 42
                                    </Button>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LogPage;