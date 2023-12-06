import { User } from '../types';

interface FriendListProps {
	friends: User[];
	onRemove: (friendId: number) => void;
}

const FriendList = ({ friends, onRemove }: FriendListProps) => {
	return (
		<div>
			<h2>Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						{friend.username ? friend.username : 'Unknown User'}
						<button
							onClick={() =>
								friend.friendship_id && onRemove(friend.friendship_id)
							}
						>
							Remove
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;
