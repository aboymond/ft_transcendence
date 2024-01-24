import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import React, { useEffect } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';
import { useAuth } from '../hooks/useAuth';

function GameWindow() {
	const { user } = useAuth();
	const context = React.useContext(WebSocketContext);
	const ws = context?.socket;
	const gameState = context?.gameState;

	useEffect(() => {
		if (ws && user && user.id) {
			launchGame(ws, null, user.id);
		}
	}, [ws, gameState, user]);

	return <Container id="game_window" className={styles.window}></Container>;
}

export default GameWindow;
