// import { useEffect } from 'react';
// import apiService from '../services/apiService';
import { FriendRequest } from '../types';
import { useAuth } from '../hooks/useAuth';

interface FriendRequestsProps {
	requests: FriendRequest[];
	onAccept: (requestId: number) => void;
	onReject: (requestId: number) => void;
}

const FriendRequests = ({ requests, onAccept, onReject }: FriendRequestsProps) => {
	const { user } = useAuth();
	return (
		<div>
			<p>Friend Requests</p>
			<ul>
				{requests.map((request) => (
					<li key={request.id}>
						{request.requester?.username === user?.username
							? `You sent a friend request to ${request.receiver?.username || 'Unknown User'}`
							: `${request.requester?.username || 'Unknown User'} sent you a friend request`}
						{
							request.requester?.username === user?.username ? (
								<button onClick={() => onReject(request.id)}>Cancel</button> //! TODO change to cancel ?
							) : (
								<>
									<button onClick={() => onAccept(request.id)}>Accept</button>
									<button onClick={() => onReject(request.id)}>Reject</button>
								</>
							) // Show Accept and Reject buttons for received requests
						}
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendRequests;
