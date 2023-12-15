import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';

const Window: React.FC = () => {
    const [showHistory, setShowHistory] = useState(false);
    const [showFriends, setShowFriends] = useState(false);

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
                                onClick={() => {
                                    setShowHistory(true);
                                    setShowFriends(false);
                                }}
                            >
                                History
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                            variant="primary"
                            type="submit"
                            className={styles.button}
                            onClick={() => {
                                setShowFriends(true);
                                setShowHistory(false);
                            }}
                            >Friends
                            </Button>
                        </Col>
                    </>
                )}
                {showHistory && (
                    <Col className={styles.fullWindowContent}>
                        <GameHistoryList />
                        <Button 
                            variant="primary"
                            type="submit"
                            className={`${styles.button} ${styles.closeButton}`}
                            onClick={() => setShowHistory(false)}
                        >
                            X
                        </Button>
                    </Col>
                )}
                {showFriends && (
                    <Col className={styles.fullWindowContent}>
                        <div>Friends List</div>
                        <Button 
                            variant="primary"
                            type="submit"
                            className={`${styles.button} ${styles.closeButton}`}
                            onClick={() => setShowFriends(false)}
                        >
                            X
                        </Button>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default Window;