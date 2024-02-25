import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import FriendList from './FriendsList';
import AddFriend from './AddFriend';
import FriendRequests from './FriendRequests';
import { User, FriendRequest } from '../types';
import { WebSocketContext } from './WebSocketHandler';
import { useNavigate } from 'react-router-dom';

const Friends: React.FC = () => {
	const [friends, setFriends] = useState<User[]>([]);
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
	const { isAuthenticated, token, logout } = useAuth();
	const ws = useContext(WebSocketContext);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchFriends = async () => {
			if (isAuthenticated && token) {
				try {
					const friendsList = await apiService.getFriends();
					setFriends(friendsList);
					const requestsList = await apiService.getFriendRequests();
					setFriendRequests(requestsList);
				} catch (error) {
					if ((error as Error).message === 'Unauthorized') {
						logout();
						navigate('/');
					} else {
						console.error('Failed to fetch friends:', error);
					}
				}
			}
		};
		fetchFriends();
	}, [isAuthenticated, token, logout, navigate]);

	useEffect(() => {
		if (ws?.message?.type === 'user_event') {
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
			setFriends([...friends, acceptedRequest.requester]);
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

	const handleSelectFriend = (friend: User) => {
		console.log('Selected friend:', friend);
	};

	return (
		<div>
			<hr />
			<FriendList friends={friends} onRemove={handleRemove} onSelectFriend={handleSelectFriend} />
			<hr />
			<AddFriend />
			<hr />
			<FriendRequests requests={friendRequests} onAccept={handleAccept} onReject={handleReject} />
			<hr />
		</div>
	);
};

export default Friends;
