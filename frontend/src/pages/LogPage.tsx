import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import Logo from '../components/Logo';
import styles from '../styles/LogPage.module.css';

const LogPage: React.FC = () => {
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
                            <Row>
                                <Col>
                                    <Button variant="primary" type="submit" className={styles.button}>
                                        Login
                                    </Button>
                                </Col>
                                <Col>
                                    <Button variant="primary" type="submit" className={styles.button}>
                                        Sign Up
                                    </Button>
                                </Col>
                            </Row>
                            <Button variant="primary" type="submit" className={`mt-3 ${styles.button} w-100`}>
                                Sign Up with 42
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LogPage;