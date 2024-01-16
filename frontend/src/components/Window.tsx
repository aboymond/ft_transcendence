import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, CloseButton } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';
import Friends from './Friends';
import PotentialFriends from './PotentialFriends';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

enum Mode {
    FRIENDS,
    HISTORY
}

const Window: React.FC = () => {
    // const [showHistory, setShowHistory] = useState(null);
    // const [showFriends, setShowFriends] = useState(null);
    const [showContent, setShowContent] = useState(Mode.HISTORY);
    const handleButtonClick = (content) => {setShowContent(content)};

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
                {/* {!showHistory && !showFriends && ( */}
                    <>
                        <Col> 
                            <Button 
                                variant="primary"
                                type="submit"
                                className={styles.button}
                                onClick={() => handleButtonClick(Mode.HISTORY)}
                            >
                                History
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                            variant="primary"
                            type="submit"
                            className={styles.button}
                            onClick={() => handleButtonClick(Mode.FRIENDS)}
                            >
                                Friends
                            </Button>
                        </Col>
                        
                    </>
                {/* )} */}
                <Container className={styles.cont_window}>
                    {showContent === Mode.HISTORY && (
                        <Col className={styles.fullWindowContent}>
                            {/* <CloseButton 
                                variant="primary"
                                type="submit"
                                className={`${styles.button} ${styles.closeButton}`}
                                onClick={() => setShowHistory(false)}
                            >
                            </CloseButton> */}
                            <GameHistoryList />
                        </Col>
                    )}
                    {showContent === Mode.FRIENDS && (
                        <Col className={styles.fullWindowContent}>
                            {/* <CloseButton 
                                variant="primary"
                                type="submit"
                                className={`${styles.button} ${styles.closeButton}`}
                                onClick={() => setShowFriends(false)}
                            >
                            </CloseButton> */}
                            <PotentialFriends />
                            {/* {friends.length > 0 ? <Friends /> : <PotentialFriends />} */}
                        </Col>
                    )}

                </Container>

            </Row>
        </Container>
    );
}

export default Window;