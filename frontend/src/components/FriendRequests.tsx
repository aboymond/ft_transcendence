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

	const receivedRequests = requests.filter((request) => request.requester?.username !== user?.username);
	const sentRequests = requests.filter((request) => request.requester?.username === user?.username);

	return (
		<div>
			<p>Friend Requests</p>
			<ul>
				{receivedRequests.map((request) => (
					<div
						key={request.id}
						style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<p style={{ margin: '0' }}>{`${request.requester?.username || 'Unknown User'}`}</p>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<button
								style={{ border: 'none', background: 'transparent', padding: '0' }}
								onClick={() => onAccept(request.id)}
							>
								+
							</button>
							<button
								style={{ border: 'none', background: 'transparent', padding: '0' }}
								onClick={() => onReject(request.id)}
							>
								x
							</button>
						</div>
					</div>
				))}
			</ul>
			<hr />
			<ul>
				{sentRequests.map((request) => (
					<div
						key={request.id}
						style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<p style={{ margin: '0' }}>{`${request.receiver?.username || 'Unknown User'}`}</p>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<button
								style={{ border: 'none', background: 'transparent', padding: '0' }}
								onClick={() => onReject(request.id)}
							>
								x
							</button>
						</div>
					</div>
				))}
			</ul>
		</div>
	);
};
export default FriendRequests;
