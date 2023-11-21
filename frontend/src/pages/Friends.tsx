import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { Friend } from '../types';

const Friends: React.FC = () => {
	const [friends, setFriends] = useState<Friend[]>([]);
	const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
	const auth = useAuth();

	useEffect(() => {
		const fetchFriends = async () => {
			if (auth.isAuthenticated && auth.token) {
				try {
					const friendsList = await apiService.getFriends();
					setFriends(friendsList);
					const requestsList = await apiService.getFriendRequests();
					setFriendRequests(requestsList);
				} catch (error) {
					console.error('Failed to fetch friends:', error);
				}
			}
		};
		fetchFriends();
	}, [auth.isAuthenticated, auth.token]);

	const handleAcceptRequest = async (requestId: number) => {
		if (auth.isAuthenticated && auth.token) {
			// Add null check for auth.token
			try {
				const requestIdNumber = requestId; // Convert string ID to number
				await apiService.acceptFriendRequest(requestIdNumber);
				// Update friend requests and friends list
			} catch (error) {
				console.error('Error accepting friend request:', error);
			}
		}
	};

	const handleRejectRequest = async (requestId: number) => {
		if (auth.isAuthenticated && auth.token) {
			try {
				const requestIdNumber = requestId;
				await apiService.rejectFriendRequest(requestIdNumber);
				// Update friend requests list
			} catch (error) {
				console.error('Error rejecting friend request:', error);
			}
		}
	};

	const handleRemoveFriend = async (friendId: number) => {
		if (auth.isAuthenticated && auth.token) {
			try {
				const friendIdNumber = friendId;
				await apiService.removeFriend(friendIdNumber);
				// Update friends list
			} catch (error) {
				console.error('Error removing friend:', error);
			}
		}
	};

	return (
		<div>
			<h2>Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						{friend.username}
						<button onClick={() => handleRemoveFriend(friend.id)}>
							Remove
						</button>
					</li>
				))}
			</ul>
			<h2>Friend Requests</h2>
			<ul>
				{friendRequests.map((request) => (
					<li key={request.id}>
						{request.sender?.username}
						<button onClick={() => handleAcceptRequest(request.id)}>
							Accept
						</button>
						<button onClick={() => handleRejectRequest(request.id)}>
							Reject
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default Friends;
