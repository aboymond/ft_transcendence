import { Friend } from '../types';

interface FriendListProps {
	friends: Friend[];
}

const FriendList = ({ friends }: FriendListProps) => {
	return (
		<div>
			<h2>Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>{friend.user.username}</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;
