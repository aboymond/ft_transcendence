import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';

const Window: React.FC = () => {
    const [showHistory, setShowHistory] = useState(false);

    return (
        <Container className={styles.window}>
            <Row>
                <Col> 
                    <Button 
                        variant="primary"
                        type="submit"
						className={styles.button}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        History
                    </Button>
                    {showHistory && <GameHistoryList />}
                </Col>
                <Col>
                    <Button 
                    variant="primary"
                    type="submit"
					className={styles.button}
                    >Friends
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Window;