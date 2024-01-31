import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GameState } from '../types';
import { User } from '../types';

interface Props {
	children: ReactNode;
}

interface WebSocketContextType {
	user: User | null;
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
	const { user, isAuthenticated } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const gameSocketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState<unknown>(null); // TODO type this
	// const [gameId, setGameId] = useState<number | null>(null);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [userStatus, setUserStatus] = useState<{ [userId: string]: string }>({});

	const messageHandler = (e) => {
		const { type, payload } = JSON.parse(e.data);
		const { action, data } = payload;
		console.log('WebSocketHandler:', { type, action, data });
		setMessage({ type, action, data });

		// if (type === 'game_event' && action === 'game_created') {
		// 	console.log('game created:', data.game_id);
		// 	setGameId(data.game_id);
		// }
		if (type === 'user_event' && action === 'user_status') {
			setUserStatus((prevStatus) => ({ ...prevStatus, [data.user_id]: data.status }));
		}
	};

	useEffect(() => {
		// General request WebSocket
		if (!user?.id) {
			return;
		}
		// console.log('useEffect triggered:', { userId: user?.id, isAuthenticated, gameId });

		const socketUrl = 'ws://localhost:8000/ws/general_requests/' + user.id + '/';
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket(socketUrl);
			console.log('General request WebSocket opened:', user.id);
			socketRef.current.addEventListener('message', messageHandler);
		}

		// // Game WebSocket
		// if (gameId !== null) {
		// 	socketUrl = 'ws://localhost:8000/ws/game/' + gameId + '/';
		// 	if (!gameSocketRef.current || gameSocketRef.current.readyState !== WebSocket.OPEN) {
		// 		gameSocketRef.current = new WebSocket(socketUrl);
		// 		console.log('Game WebSocket opened:', gameId);
		// 		gameSocketRef.current.addEventListener('message', messageHandler);
		// 	}
		// }

		return () => {
			if (socketRef.current) {
				socketRef.current.removeEventListener('message', messageHandler);
				socketRef.current.close();
				console.log('General request WebSocket closed');
			}
			if (gameSocketRef.current) {
				gameSocketRef.current.removeEventListener('message', messageHandler);
				gameSocketRef.current.close();
				console.log('Game WebSocket closed');
			}
		};
	}, [user?.id, isAuthenticated]);

	return (
		<WebSocketContext.Provider
			value={{
				user,
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
