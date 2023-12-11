import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Props {
	children: ReactNode;
}

interface WebSocketContextType {
	socket: WebSocket | null;
	message: any;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketHandler: React.FC<Props> = ({ children }) => {
	const { user } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState(null); // Add this line

	useEffect(() => {
		if (!user?.id) {
			return;
		}

		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket('ws://localhost:8000/ws/general_requests/' + user.id + '/');

			socketRef.current.onmessage = (e) => {
				const data = JSON.parse(e.data);
				console.log('data:', data);
				setMessage(data);
			};
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, [user?.id]);

	return (
		<WebSocketContext.Provider value={{ socket: socketRef.current, message }}>
			{children}
		</WebSocketContext.Provider>
	);
};

export default WebSocketHandler;
