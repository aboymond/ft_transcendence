import React, { useState, useEffect } from 'react';
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

	useEffect(() => {
		const socket = new WebSocket(
			'ws://localhost:8000/ws/friend_requests/' + user?.id + '/',
		);

		socket.onopen = function (e) {
			console.log('Connection to server opened');
		};

		socket.onmessage = function (e) {
			if (socket.readyState === WebSocket.OPEN) {
				const data = JSON.parse(e.data);
				console.log('Message:', data.message);

				// Update friend request list
				apiService.getFriendRequests().then(setFriendRequests);
			}
		};

		socket.onclose = function (event) {
			console.error('friend_requests socket closed unexpectedly', event);
		};

		socket.onerror = function (error) {
			console.error('WebSocket error: ', error);
		};

		return () => {
			socket.close();
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
