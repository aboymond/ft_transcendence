import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import FriendList from '../components/FriendsList';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';
import { User, FriendRequest } from '../types';

const FriendsPage: React.FC = () => {
	const [friends, setFriends] = useState<User[]>([]);
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
	const auth = useAuth();

	const { user } = useAuth();

	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!user?.id) {
			// If user ID is not loaded yet, don't open the WebSocket connection
			return;
		}

		// Only open a new WebSocket connection if one isn't already open
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			socketRef.current = new WebSocket(
				'ws://localhost:8000/ws/friend_requests/' + user.id + '/',
			);

			socketRef.current.onopen = function (e) {
				console.log('Connection to server opened');
			};

			socketRef.current.onmessage = function (e) {
				console.log('Message received from server:', e.data);
				if (socketRef.current?.readyState === WebSocket.OPEN) {
					const data = JSON.parse(e.data);
					console.log('Message:', data.message);

					// Update friend request list
					apiService.getFriendRequests().then(setFriendRequests);
				}
			};

			socketRef.current.onclose = function (event) {
				console.error('friend_requests socket closed unexpectedly', event);
			};

			socketRef.current.onerror = function (error) {
				console.error('WebSocket error: ', error);
				console.log('WebSocket readyState: ', socketRef.current?.readyState);
			};
		}

		// Cleanup function to close the WebSocket connection when the component is unmounted
		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, [user?.id]);

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

	const handleAccept = async (requestId: number) => {
		try {
			const acceptedRequest = await apiService.acceptFriendRequest(requestId);
			setFriendRequests(
				friendRequests.filter((request) => request.id !== requestId),
			);
			setFriends([...friends, acceptedRequest.receiver]);
		} catch (error) {
			console.error('Error accepting request:', error);
		}
	};

	const handleReject = async (requestId: number) => {
		try {
			await apiService.rejectFriendRequest(requestId);
			setFriendRequests(
				friendRequests.filter((request) => request.id !== requestId),
			);
		} catch (error) {
			console.error('Error rejecting request:', error);
		}
	};

	const handleRemove = async (friendshipId: number) => {
		try {
			await apiService.removeFriend(friendshipId);
			setFriends(
				friends.filter((friend) => friend.friendship_id !== friendshipId),
			);
		} catch (error) {
			console.error('Error removing friend:', error);
		}
	};

	return (
		<div>
			<h1>My Friends</h1>
			<AddFriend />
			<FriendList friends={friends} onRemove={handleRemove} />
			<FriendRequests
				requests={friendRequests}
				onAccept={handleAccept}
				onReject={handleReject}
			/>
		</div>
	);
};

export default FriendsPage;
