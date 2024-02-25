import { useEffect, useRef, ReactNode, createContext, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { GameState } from '../types';
import { User, WebSocketMessage } from '../types';
import { toast } from 'react-toastify';

interface Props {
	children: ReactNode;
}

interface FriendRequestReceived {
	senderName: string;
	requestId: string;
	status: 'sent' | 'accepted';
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
	newFriendRequests: boolean;
	setNewFriendRequests: React.Dispatch<React.SetStateAction<boolean>>;
	friendRequestReceived: FriendRequestReceived | null;
	acceptFriendRequest: (requestId: string) => Promise<void>;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

const WebSocketHandler: React.FC<Props> = ({ children }) => {
	const { user, isAuthenticated, token } = useAuth();
	const socketRef = useRef<WebSocket | null>(null);
	const [message, setMessage] = useState<WebSocketMessage | null>(null);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [userStatus, setUserStatus] = useState<{ [userId: string]: string }>({});
	const [newFriendRequests, setNewFriendRequests] = useState(false);
	const [friendRequestReceived, setFriendRequestReceived] = useState<FriendRequestReceived | null>(null);

	const acceptFriendRequest = async (requestId: string) => {
		console.log(`Accepting friend request with ID: ${requestId}`);
		setFriendRequestReceived((prevState) => ({
			...(prevState || { senderName: '', requestId: '', status: 'sent' }),
			status: 'accepted',
		}));
		toast.success(`Friend request accepted from user with ID: ${requestId}`);
		setNewFriendRequests(false);
	};

	const messageHandler = (e: MessageEvent) => {
		const { type, payload } = JSON.parse(e.data);
		const { action, data } = payload;
		setMessage({ type, payload: { action, data } });

		if (type === 'user_event' && action === 'user_status') {
			setUserStatus((prevStatus) => ({ ...prevStatus, [data.user_id]: data.status }));
		}

		if (type === 'friend_request') {
			if (action === 'send_friend_request') {
				setNewFriendRequests(true);
				setFriendRequestReceived({
					senderName: data.sender_name,
					requestId: data.request_id,
					status: 'sent',
				});
			} else if (action === 'accept_friend_request') {
				setFriendRequestReceived((prev) => {
					if (!prev) {
						return null;
					}
					return {
						...prev,
						status: 'accepted',
						senderName: data.sender_name || prev.senderName,
						requestId: data.request_id || prev.requestId,
					};
				});
				toast.success(`${data.sender_name} accepted your friend request.`);
			}
		}
		if (type === 'tournament_message') {
			// TODO
		}
	};

	useEffect(() => {
		if (!user?.id) {
			return;
		}

		const hostname = import.meta.env.VITE_HOSTNAME;
		const socketUrl = `${hostname}/ws/general_requests/` + user.id + '/';
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket(socketUrl);
			socketRef.current.addEventListener('message', messageHandler);
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.removeEventListener('message', messageHandler);
				socketRef.current.close();
			}
		};
	}, [user?.id, isAuthenticated, token]);

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
				newFriendRequests,
				setNewFriendRequests,
				friendRequestReceived,
				acceptFriendRequest,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	);
};

export default WebSocketHandler;
