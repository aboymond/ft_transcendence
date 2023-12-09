import { User } from '../types';

interface FriendListProps {
	friends: User[];
	onRemove: (friendId: number) => void;
}

const FriendList = ({ friends, onRemove }: FriendListProps) => {
	return (
		<div>
			<p>Friends</p>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							{friend.username ? friend.username : 'Unknown User'}
							<button
								style={{ border: 'none', background: 'transparent' }}
								onClick={() => friend.friendship_id && onRemove(friend.friendship_id)}
							>
								×
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;
