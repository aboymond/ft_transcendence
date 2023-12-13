import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '../styles/Window.module.css';

const Window: React.FC = () => {
    return (
        <Container className={styles.window}>
            <Row>
                <Col> 
                    <Button 
                    variant="primary"
                    type="submit"
					className={styles.button}
                    >
                        History
                    </Button>
                    {/* Your component content goes here */}
                </Col>
                <Col>
                    <Button 
                    variant="primary"
                    type="submit"
                    className={styles.button}
                    >
                    Friends
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}

export default Window;