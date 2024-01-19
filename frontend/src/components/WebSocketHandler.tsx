import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
	children: ReactNode;
}

interface WebSocketContextType {
	socket: WebSocket | null;
	gameSocket: WebSocket | null;
	message: any;
	setMessage: React.Dispatch<React.SetStateAction<any>>;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketHandler: React.FC<Props> = ({ children }) => {
	const { user } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const gameSocketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState(null);
	const [gameId, setGameId] = useState<number | null>(null);

	useEffect(() => {
		// General request WebSocket
		if (!user?.id) {
			return;
		}

		let socketUrl = 'ws://localhost:8000/ws/general_requests/' + user.id + '/';
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket(socketUrl);

			socketRef.current.onopen = () => {
				console.log('General request WebSocket opened');
			};

			socketRef.current.onmessage = (e) => {
				const data = JSON.parse(e.data);
				console.log('data:', data);
				setMessage(data);

				if (data.game_id) {
					setGameId(data.game_id);
				}
			};
		}

		// Game WebSocket
		if (gameId !== null) {
			socketUrl = 'ws://localhost:8000/ws/game/' + gameId + '/';
			if (!gameSocketRef.current || gameSocketRef.current.readyState !== WebSocket.OPEN) {
				gameSocketRef.current = new WebSocket(socketUrl);

				gameSocketRef.current.onopen = () => {
					console.log('Game WebSocket opened');
				};

				gameSocketRef.current.onmessage = (e) => {
					const data = JSON.parse(e.data);
					console.log('game data:', data);
					// Handle game data...
				};
			}
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
				console.log('General request WebSocket closed');
			}
			if (gameSocketRef.current) {
				gameSocketRef.current.close();
				console.log('Game WebSocket closed');
			}
		};
	}, [user?.id, gameId]);

	return (
		<WebSocketContext.Provider
			value={{ socket: socketRef.current, gameSocket: gameSocketRef.current, message, setMessage }}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export default WebSocketHandler;
