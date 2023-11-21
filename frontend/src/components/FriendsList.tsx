import { useEffect, useState } from 'react';
import apiService from '../services/apiService';
import { Friend } from '../types';

const FriendList = () => {
	const [friends, setFriends] = useState<Friend[]>([]);

	useEffect(() => {
		const fetchFriends = async () => {
			try {
				const friendsList = await apiService.getFriends();
				setFriends(friendsList);
			} catch (error) {
				console.error('Failed to fetch friends:', error);
			}
		};

		fetchFriends();
	}, []);

	return (
		<div>
			<h2>My Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						{friend.username} -{' '}
						<span className={`status ${friend.status}`}>{friend.status}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;
