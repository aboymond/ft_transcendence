import { User } from '../types';

interface FriendListProps {
	friends: User[];
	onRemove: (friendId: number) => void;
}

const FriendList = ({ friends, onRemove }: FriendListProps) => {
	return (
		<div>
			<p style={{ textAlign: 'center' }}>Friends</p>
			<ul style={{ maxHeight: '6em', overflowY: 'auto' }}>
				{friends.map((friend) => (
					<li key={friend.id}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<p style={{ margin: '0' }}>{friend.username ? friend.username : 'Unknown User'}</p>
							<button
								style={{ border: 'none', background: 'transparent' }}
								onClick={() => friend.friendship_id && onRemove(friend.friendship_id)}
							>
								x
							</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default FriendList;

//ajouter de pouvoir accepter les friends avec + car on peut avoir la list et juste refuser 
//de plus, ça nous affiche pas vraiment la liste ni de nos amis, ni des amis qu'on peut ajouter (potentialFriends le fait)