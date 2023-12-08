import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import Game from './Game';

function GameWindow() {
	return (
		<Container className={styles.game_window}>
			<Game />
		</Container>
	);
}

export default GameWindow;
