import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import React, { useEffect } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';

function GameWindow() {
	const context = React.useContext(WebSocketContext);
	const ws = context?.socket;
	const gameState = context?.gameState;

	useEffect(() => {
		console.log('ws:', ws);
		console.log('context.gameState:', gameState);
		if (ws) {
			launchGame(ws, null);
		}
	}, [ws, gameState]);

	return <Container id="game_window" className={styles.window}></Container>;
}

export default GameWindow;
