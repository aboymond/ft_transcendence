import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, CloseButton } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';
import Friends from './Friends';
import PotentialFriends from './PotentialFriends';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

const Window: React.FC = () => {
    const [showHistory, setShowHistory] = useState(false);
    const [showFriends, setShowFriends] = useState(false);
    const [friends, setFriends] = useState<User[]>([]);
    const auth = useAuth();

    useEffect(() => {
        const fetchFriends = async () => {
            if (auth.isAuthenticated && auth.token) {
                try {
                    const friendsList = await apiService.getFriends();
                    setFriends(friendsList);
                } catch (error) {
                    console.error('Failed to fetch friends:', error);
                }
            }
        };
        fetchFriends();
    }, [auth.isAuthenticated, auth.token]);

    return (
        <Container className={styles.window}>
            <Row className={styles.row}>
                {!showHistory && !showFriends && (
                    <>
                        <Col> 
                            <Button 
                                variant="primary"
                                type="submit"
                                className={styles.button}
                                onClick={() => setShowHistory(true)}
                            >
                                History
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                            variant="primary"
                            type="submit"
                            className={styles.button}
                            onClick={() => setShowFriends(true)}
                            >
                                Friends
                            </Button>
                        </Col>
                    </>
                )}
                {showHistory && (
                    <Col className={styles.fullWindowContent}>
                        <CloseButton 
                            variant="primary"
                            type="submit"
                            className={`${styles.button} ${styles.closeButton}`}
                            onClick={() => setShowHistory(false)}
                        >
                        </CloseButton>
                        <GameHistoryList />
                    </Col>
                )}
                {showFriends && (
                    <Col className={styles.fullWindowContent}>
                        <CloseButton 
                            variant="primary"
                            type="submit"
                            className={`${styles.button} ${styles.closeButton}`}
                            onClick={() => setShowFriends(false)}
                        >
                        </CloseButton>
                        {friends.length > 0 ? <Friends /> : <PotentialFriends />}
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default Window;