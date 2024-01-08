import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import FriendList from './FriendsList';
import AddFriend from './AddFriend';
import FriendRequests from './FriendRequests';
import { User, FriendRequest } from '../types';
import { WebSocketContext } from './WebSocketHandler';

const Friends: React.FC = () => {
	const [friends, setFriends] = useState<User[]>([]);
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
	const auth = useAuth();
	const ws = useContext(WebSocketContext);

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

	useEffect(() => {
		if (ws?.message) {
			console.log('ws.message:', ws.message);
			// Fetch the updated list of friends from the server
			const fetchFriends = async () => {
				try {
					const friendsList = await apiService.getFriends();
					setFriends(friendsList);
					const requestsList = await apiService.getFriendRequests();
					setFriendRequests(requestsList);
				} catch (error) {
					console.error('Failed to fetch friends:', error);
				}
			};
			fetchFriends();
		}
	}, [ws?.message]);

	const handleAccept = async (requestId: number) => {
		try {
			const acceptedRequest = await apiService.acceptFriendRequest(requestId);
			setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
			setFriends([...friends, acceptedRequest.receiver]);
		} catch (error) {
			console.error('Error accepting request:', error);
		}
	};

	const handleReject = async (requestId: number) => {
		try {
			await apiService.rejectFriendRequest(requestId);
			setFriendRequests(friendRequests.filter((request) => request.id !== requestId));
		} catch (error) {
			console.error('Error rejecting request:', error);
		}
	};

	const handleRemove = async (friendshipId: number) => {
		try {
			await apiService.removeFriend(friendshipId);
			setFriends(friends.filter((friend) => friend.friendship_id !== friendshipId));
		} catch (error) {
			console.error('Error removing friend:', error);
		}
	};

	return (
		<div>
			<hr />
			<FriendList friends={friends} onRemove={handleRemove} />
			<hr />
			<AddFriend />
			<hr />
			<FriendRequests requests={friendRequests} onAccept={handleAccept} onReject={handleReject} />
			<hr />
		</div>
	);
};

export default Friends;
