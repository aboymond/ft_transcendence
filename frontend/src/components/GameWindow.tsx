import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import React, { useEffect, useState } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';

function GameWindow() {
	const context = React.useContext(WebSocketContext);
	const ws = context?.socket;
	const user = context?.user;
	const [gameLaunched, setGameLaunched] = useState(false);
	//TODO  const gameState = context?.gameState;

	useEffect(() => {
		if (ws && user && user.id && !gameLaunched) {
			launchGame(ws, null, user.id);
			setGameLaunched(true);
		}
	}, [ws, user, gameLaunched]);

	return <Container id="game_window" className={styles.window}></Container>;
}

export default GameWindow;
