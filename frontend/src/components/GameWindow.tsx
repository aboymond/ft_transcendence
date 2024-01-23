import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import React, { useEffect } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';

function GameWindow() {
	const context = React.useContext(WebSocketContext);
	const ws = context?.socket;

	useEffect(() => {
		console.log('ws:', ws);
		console.log('context.gameState:', context?.gameState);
		if (ws && context?.gameState) {
			launchGame(ws, context?.gameState);
		}
	}, [ws, context?.gameState]);

	return <Container id="game_window" className={styles.window}></Container>;
}

export default GameWindow;
