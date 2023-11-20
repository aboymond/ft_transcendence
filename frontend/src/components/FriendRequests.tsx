import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { Friend } from '../types';

const FriendRequests = () => {
	const [requests, setRequests] = useState<Friend[]>([]);

	useEffect(() => {
		const fetchRequests = async () => {
			try {
				const requestsList = await apiService.getFriendRequests();
				setRequests(requestsList);
			} catch (error) {
				console.error('Error fetching friend requests:', error);
			}
		};

		fetchRequests();
	}, []);

	const handleAccept = async (requestId: number) => {
		try {
			await apiService.acceptFriendRequest(requestId);
			// Update the UI by filtering out the accepted request
			setRequests(requests.filter((request) => request.id !== requestId));
		} catch (error) {
			console.error('Error accepting request:', error);
		}
	};

	const handleReject = async (requestId: number) => {
		try {
			await apiService.rejectFriendRequest(requestId);
			// Update the UI by filtering out the rejected request
			setRequests(requests.filter((request) => request.id !== requestId));
		} catch (error) {
			console.error('Error rejecting request:', error);
		}
	};

	return (
		<div>
			<h2>Friend Requests</h2>
			<ul>
				{requests.map((request) => (
					<li key={request.id}>
						{request.sender?.username || 'Unknown User'}
						<button onClick={() => handleAccept(request.id)}>Accept</button>
						<button onClick={() => handleReject(request.id)}>Reject</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendRequests;
