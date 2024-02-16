import React from 'react';
import { User } from '../types';

interface FriendListProps {
    friends: User[];
    onRemove: (friendId: number) => void;
    onSelectFriend: (friend: User) => void; 
}

const FriendList: React.FC<FriendListProps> = ({ friends, onRemove, onSelectFriend }) => {
    return (
        <div>
            <p style={{ textAlign: 'center' }}>Friends</p>
            <ul style={{ maxHeight: '6em', overflowY: 'auto' }}>
                {friends.map((friend) => (
                    <li key={friend.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ margin: '0', cursor: 'pointer' }} onClick={() => onSelectFriend(friend)}>
                            {friend.username ? friend.username : 'Unknown User'}
                        </p>
                        <button
                            style={{ border: 'none', background: 'transparent' }}
                            onClick={(e) => {
                                e.stopPropagation(); // Empêche l'événement onClick de onSelectFriend
                                friend.friendship_id && onRemove(friend.friendship_id);
                            }}
                        >
                            x
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FriendList;

