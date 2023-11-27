import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import FriendList from '../components/FriendsList';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';
import { Friend, FriendRequest } from '../types';

const FriendsPage: React.FC = () => {
	const [friends, setFriends] = useState<Friend[]>([]);
	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
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

	const handleAccept = async (requestId: number) => {
		try {
			await apiService.acceptFriendRequest(requestId);
			setFriendRequests(
				friendRequests.filter((request) => request.id !== requestId),
			);
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

	return (
		<div>
			<h1>My Friends</h1>
			<AddFriend />
			<FriendList friends={friends} />
			<FriendRequests
				requests={friendRequests}
				onAccept={handleAccept}
				onReject={handleReject}
			/>
		</div>
	);
};

export default FriendsPage;
