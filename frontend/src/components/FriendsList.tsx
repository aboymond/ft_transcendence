import { User } from '../types';

interface FriendListProps {
	friends: User[];
}

const FriendList = ({ friends }: FriendListProps) => {
	console.log(friends);
	return (
		<div>
			<h2>Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						{friend.username ? friend.username : 'Unknown User'}
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;
