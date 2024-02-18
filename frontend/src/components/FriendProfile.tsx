import React, { useEffect, useState } from 'react';
import { User, GameHistory } from '../types';
import styles from '../styles/FriendProfile.module.css';
import { apiService } from '../services/apiService';

interface FriendProfileProps {
	friend: User;
	onClose: () => void;
}

const FriendProfile: React.FC<FriendProfileProps> = ({ friend, onClose }) => {
	const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);

	useEffect(() => {
		apiService.getUserGameHistory(friend.id).then(setGameHistory).catch(console.error);
	}, [friend.id]);

	return (
		<div className={styles.container}>
			<button className={styles.closeButton} onClick={onClose}>
				x
			</button>
			<p>Username: {friend.username}</p>
			<p>Display Name: {friend.display_name}</p>
			<p>Wins: {friend.wins}</p>
			<p>Losses: {friend.losses}</p>
			<p>Status: {friend.status}</p>
			<div className={styles.centeredContent}>
				<h4 className={styles.title}>Game History</h4>
				<ul className={styles.gameHistoryList}>
					{gameHistory.map((game) => (
						<li key={game.id} className={styles.gameHistoryItem}>
							{game.players[0].username} {game.player1_score} - {game.player2_score}{' '}
							{game.players[1].username}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default FriendProfile;
