import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { User } from '../types';
import styles from '../styles/PotentialFriends.module.css';
import FriendProfile from './FriendProfile';

interface PotentialFriendsProps {
    friends: User[];
	onSelectFriend: (friend: User) => void;
}

const PotentialFriends: React.FC<PotentialFriendsProps> = ({ friends, onSelectFriend }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const auth = useAuth();
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (auth.isAuthenticated && auth.token) {
                try {
                    const allUsers = await apiService.getUsers();
                    const filteredUsers = allUsers.filter(user => user.username !== auth.user?.username);
                    setUsers(filteredUsers);
                } catch (error) {
                    console.error('Failed to fetch users:', error);
                }
            }
        };
        fetchUsers();
    }, [auth.isAuthenticated, auth.token, auth.user?.username]);


	const handleAddFriend = async (username: string, event: React.MouseEvent) => {
		event.stopPropagation();

		const userToSelect = users.find(user => user.username === username);
		if (userToSelect) {
			onSelectFriend(userToSelect);
		}
        const friendrequests = await apiService.getFriendRequests();
        const isRequestPending = friendrequests.some(request => request.receiver.username === username);
        if (isRequestPending) {
            console.log('Friend request is already pending');
            return;
        }
		try {
			await apiService.sendFriendRequest(username);
			setUsers(prevUsers => prevUsers.filter(user => user.username !== username));
		} catch (error) {
			console.error('Failed to send friend request:', error);
        }
	};

    const isUserAFriend = (username: string) => {
        return friends.some(friend => friend.username === username);
    };

    if (selectedFriend) {
        return <FriendProfile friend={selectedFriend} onClose={() => setSelectedFriend(null)} />;
    }

    return (
        <div className={styles.potentialFriendsContainer}>
            <input
                className={styles.search}
                type="text"
                placeholder="Search friends"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                <div key={user.id} className={styles.friendItem}>
                    <p className={styles.p} onClick={() => setSelectedFriend(user)}>
                        {user.username}
                    </p>
                    {!isUserAFriend(user.username) && (
                        
                        <button className={styles.load} onClick={(e) => handleAddFriend(user.username, e)}>+</button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default PotentialFriends;
