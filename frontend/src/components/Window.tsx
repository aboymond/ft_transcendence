import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from '../styles/Window.module.css';

const Window: React.FC = () => {
    return (
        <Container className={styles.window}>
            <Row>
                <Col> 
                    {/* Your component content goes here */}
                </Col>
            </Row>
        </Container>
    );
}

export default Window;