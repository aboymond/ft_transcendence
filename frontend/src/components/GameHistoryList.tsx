import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { GameHistory } from '../types'; // Ensure this type is updated accordingly
import styles from '../styles/GameHistoryList.module.css';
import { useAuth } from '../hooks/useAuth';

const GameHistoryList: React.FC = () => {
	const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
	const [page, setPage] = useState(0);
	const navigate = useNavigate();
	const { logout } = useAuth();

	useEffect(() => {
		apiService
			.getGameHistory()
			.then((data) => {
				const sortedData = data.sort((a, b) => {
					return new Date(b.played_at).getTime() - new Date(a.played_at).getTime();
				});
				setGameHistory(sortedData);
			})
			.catch((error) => {
				if ((error as Error).message === 'Unauthorized') {
					logout();
					navigate('/');
				}
			});
	}, [logout, navigate]);

	const loadNextPage = () => {
		setPage(page + 1);
	};

	const loadPreviousPage = () => {
		if (page > 0) {
			setPage(page - 1);
		}
	};

	return (
		<div className={styles.centeredContent}>
			<ul className={styles.gameHistoryList}>
				{gameHistory.slice(page * 10, (page + 1) * 10).map((game) => (
					<li className={styles.gameHistoryItem} key={game.id}>
						{game.player1 && game.player2 ? (
							<>
								{game.player1.username} {game.player1_score} - {game.player2_score} {game.player2.username}
							</>
						) : (
							'Game data is incomplete'
						)}
					</li>
				))}
			</ul>
			<div style={{ display: 'flex', flexDirection: 'row' }}>
				{gameHistory.length > 10 && (
					<>
						<button className={styles.load} onClick={loadPreviousPage} disabled={page === 0}>
							Previous
						</button>
						<button
							className={styles.load}
							onClick={loadNextPage}
							disabled={(page + 1) * 10 >= gameHistory.length}
						>
							Next
						</button>
					</>
				)}
			</div>
		</div>
	);
};

export default GameHistoryList;
