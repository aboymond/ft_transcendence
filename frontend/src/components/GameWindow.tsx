import { Container } from 'react-bootstrap';
import styles from '../styles/GameWindow.module.css';
import { launchGame } from '../../gameV2/main';
import React, { useEffect } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';

function GameWindow() {
	const context = React.useContext(WebSocketContext);
	const ws = context?.socket; // Access the WebSocket

	// const [playerNumber, setPlayerNumber] = useState<number>(1); // TODO Set to 1 or 2 depending on the player

	// const handleKeyPress = (event) => {
	// 	if (ws) {
	// 		ws.send(JSON.stringify({ action: 'key_press', key: event.key, player: playerNumber }));
	// 	}
	// };

	useEffect(() => {
		if (ws && context?.gameState) {
			launchGame(ws, context?.gameState);
		}
	}, [ws, context?.gameState]);

	return <Container id="game_window" className={styles.window}></Container>;
}

export default GameWindow;
