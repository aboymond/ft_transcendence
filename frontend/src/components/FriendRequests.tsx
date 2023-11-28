// import { useEffect } from 'react';
// import apiService from '../services/apiService';
import { FriendRequest } from '../types';

interface FriendRequestsProps {
	requests: FriendRequest[];
	onAccept: (requestId: number) => void;
	onReject: (requestId: number) => void;
}

const FriendRequests = ({
	requests,
	onAccept,
	onReject,
}: FriendRequestsProps) => {
	return (
		<div>
			<h2>Friend Requests</h2>
			<ul>
				{requests.map((request) => (
					<li key={request.id}>
						{request.requester?.username || 'Unknown User'}
						<button onClick={() => onAccept(request.id)}>Accept</button>
						<button onClick={() => onReject(request.id)}>Reject</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendRequests;
