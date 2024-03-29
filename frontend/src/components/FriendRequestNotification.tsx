import React, { useContext, useEffect } from 'react';
import { WebSocketContext } from '../components/WebSocketHandler';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FriendRequestNotification: React.FC = () => {
	const webSocketContext = useContext(WebSocketContext);

	useEffect(() => {
		const friendRequest = webSocketContext?.friendRequestReceived;
		if (friendRequest) {
			if (friendRequest.status === 'sent') {
				toast(`${friendRequest.senderName} sent you a friend request.`);
			}
		}
	}, [webSocketContext?.friendRequestReceived]);

	if (!webSocketContext || !webSocketContext.newFriendRequests) {
		return null;
	}

	return (
		<>
			<ToastContainer />
		</>
	);
};

export default FriendRequestNotification;
