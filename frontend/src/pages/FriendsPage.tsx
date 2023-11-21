import React from 'react';
import FriendList from '../components/FriendsList';
import AddFriend from '../components/AddFriend';
import FriendRequests from '../components/FriendRequests';

const FriendsPage: React.FC = () => {
	return (
		<div>
			<h1>My Friends</h1>
			<AddFriend />
			<FriendList />
			<FriendRequests />
		</div>
	);
};

export default FriendsPage;
