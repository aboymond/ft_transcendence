import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GameState } from '../types';
import { User, WebSocketMessage } from '../types';

interface Props {
	children: ReactNode;
}

interface WebSocketContextType {
	user: User | null;
	socket: WebSocket | null;
	message: WebSocketMessage | null;
	setMessage: React.Dispatch<React.SetStateAction<WebSocketMessage | null>>;
	gameState: GameState | null;
	setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
	userStatus: { [userId: string]: string };
	setUserStatus: React.Dispatch<React.SetStateAction<{ [userId: string]: string }>>;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketHandler: React.FC<Props> = ({ children }) => {
	const { user, isAuthenticated } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState<WebSocketMessage | null>(null);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [userStatus, setUserStatus] = useState<{ [userId: string]: string }>({});

	const messageHandler = (e: MessageEvent) => {
		const { type, payload } = JSON.parse(e.data);
		const { action, data } = payload;
		console.log('WebSocketHandler:', { type, action, data });
		setMessage({ type, payload: { action, data } });

		if (type === 'user_event' && action === 'user_status') {
			setUserStatus((prevStatus) => ({ ...prevStatus, [data.user_id]: data.status }));
		}
	};

	useEffect(() => {
		if (!user?.id) {
			return;
		}

		const socketUrl = 'ws://localhost:8000/ws/general_requests/' + user.id + '/';
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket(socketUrl);
			console.log('General request WebSocket opened:', user.id);
			socketRef.current.addEventListener('message', messageHandler);
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.removeEventListener('message', messageHandler);
				socketRef.current.close();
				console.log('General request WebSocket closed:', user.id);
			}
		};
	}, [user?.id, isAuthenticated]);

	return (
		<WebSocketContext.Provider
			value={{
				user,
				socket: socketRef.current,
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
