import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { User } from '../types';
import styles from '../styles/PotentialFriends.module.css';

interface PotentialFriendsProps {
	friends: User[];
	onSelectFriend: (friend: User) => void;
}

const PotentialFriends: React.FC<PotentialFriendsProps> = ({ friends, onSelectFriend }) => {
	const [users, setUsers] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const auth = useAuth();
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		const fetchUsers = async () => {
			if (auth.isAuthenticated && auth.token) {
				try {
					const usersList = await apiService.getUsers();
					const filteredUsers = usersList.filter((user) => user.username !== auth.user?.username);
					setUsers(filteredUsers);
				} catch (error) {
					console.error('Failed to fetch users:', error);
				}
			}
		};
		fetchUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth.isAuthenticated, auth.token]);

	const filteredUsers = users.filter(
		(user) =>
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
			!friends.some((friend) => friend.username === user.username),
	);

	const handleAddFriend = async (username: string) => {
		try {
			await apiService.sendFriendRequest(username);
			setSuccessMessage('Friend request sent!');
			setUsers(users.filter((user) => user.username !== username));
		} catch (error) {
			let errorMessage = 'An unexpected error occurred';
			if (error instanceof Error) {
				const match = error.message.match(/string='(.*?)'/);
				errorMessage = match ? match[1] : error.message;
			}
			setErrorMessage(errorMessage);
		}
	};

	const handleFriendClick = (friend: User) => {
		onSelectFriend(friend);
	};

	//TODO fix colors
	return (
		<div className={styles.potentialFriendsContainer}>
			{successMessage && <p className={styles.successMessage}>{successMessage}</p>}
			{errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
			<div className={styles.closeButton}></div>
			<input
				className={styles.search}
				type="text"
				placeholder="Search friends"
				value={searchTerm}
				onChange={(event) => setSearchTerm(event.target.value)}
			/>
			{filteredUsers.map((user) => (
				<div key={user.id}>
					<p className={styles.p} onClick={() => handleFriendClick(user)}>
						{user.username}
					</p>
					<button className={styles.load} onClick={() => handleAddFriend(user.username)}>
						+
					</button>
				</div>
			))}
		</div>
	);
};

export default PotentialFriends;
