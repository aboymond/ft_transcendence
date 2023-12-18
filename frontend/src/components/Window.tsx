import React, { useState } from 'react';
import { Container, Row, Col, Button, CloseButton } from 'react-bootstrap';
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
                        <div>Friends List</div>
                    </Col>
                )}
            </Row>
        </Container>
    );
}

export default Window;