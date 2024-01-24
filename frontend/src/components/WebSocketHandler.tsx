import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GameState } from '../types';

interface Props {
	children: ReactNode;
}

interface WebSocketContextType {
	socket: WebSocket | null;
	gameSocket: WebSocket | null;
	message: unknown; // TODO type this
	setMessage: React.Dispatch<React.SetStateAction<unknown>>; //TODO type this
	gameState: GameState | null;
	setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
	userStatus: { [userId: string]: string };
	setUserStatus: React.Dispatch<React.SetStateAction<{ [userId: string]: string }>>;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketHandler: React.FC<Props> = ({ children }) => {
	const { user } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const gameSocketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState<unknown>(null); // TODO type this
	const [gameId, setGameId] = useState<number | null>(null);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [userStatus, setUserStatus] = useState<{ [userId: string]: string }>({});

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
				const { type, payload } = JSON.parse(e.data);
				const { action, data } = payload;
				console.log('general request data:', { type, action, data });
				setMessage({ type, action, data });

				if (type === 'game_event' && action === 'game_created') {
					setGameId(data.game_id);
				}
				if (type === 'user_event' && action === 'user_status') {
					setUserStatus((prevStatus) => ({ ...prevStatus, [data.user_id]: data.status }));
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
					const { type, payload } = JSON.parse(e.data);
					const { action, data } = payload;
					console.log('game data:', { type, action, data });
					// Update game state based on received data
					if (type === 'game_event' && action === 'game_state') {
						setGameState(data);
					}
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
			value={{
				socket: socketRef.current,
				gameSocket: gameSocketRef.current,
				message,
				setMessage,
				gameState,
				setGameState,
				userStatus,
				setUserStatus,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export default WebSocketHandler;
