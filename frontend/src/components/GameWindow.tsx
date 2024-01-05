import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import { useEffect} from 'react';

function GameWindow() {

    useEffect(() => {
        launchGame();

    }, []);

    return (
        <Container  id='game_window' className={styles.window}> 
            
        </Container>
    );
}

export default GameWindow;