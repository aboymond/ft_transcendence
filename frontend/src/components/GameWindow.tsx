import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import { useEffect } from 'react';

function GameWindow() {
    useEffect(() => {
        const launchDelay = 100; 
        setTimeout(() => {
            launchGame();
        }, launchDelay);
    }, []);

    return (
        <Container className={styles.game_window1}> 
            <div id="game_window">
                {}
            </div>
        </Container>
    );
}

export default GameWindow;
