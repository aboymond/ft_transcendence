import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '../styles/Window.module.css';
import GameHistoryList from './GameHistoryList';
import PotentialFriends from './PotentialFriends';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';
import FriendProfile from './FriendProfile';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

enum Mode {
	FRIENDS,
	HISTORY,
}

const Window: React.FC = () => {
	const [showContent, setShowContent] = useState(Mode.HISTORY);
	const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
	const [friends, setFriends] = useState<User[]>([]);
	const { isAuthenticated, token, logout } = useAuth();
	const navigate = useNavigate();

	const handleButtonClick = (content: Mode) => {
		setShowContent(content);
	};

	useEffect(() => {
		const fetchFriends = async () => {
			if (isAuthenticated && token) {
				try {
					const friendsList = await apiService.getFriends();
					setFriends(friendsList);
				} catch (error) {
					if ((error as Error).message === 'Unauthorized') {
						logout();
						navigate('/');
					} else {
						console.error('Failed to fetch friends:', error);
					}
				}
			}
		};
		fetchFriends();
	}, [isAuthenticated, token, logout, navigate]);

	const handleFriendSelect = (friend: User) => {
		setSelectedFriend(friend);
	};

	return (
		<Container className={styles.window}>
			<Row className={styles.row}>
				<Col className={styles.col}>
					<Button
						variant="primary"
						type="submit"
						className={styles.button}
						onClick={() => handleButtonClick(Mode.HISTORY)}
					>
						History
					</Button>
				</Col>
				<Col className={styles.col}>
					<Button
						variant="primary"
						type="submit"
						className={styles.button}
						onClick={() => handleButtonClick(Mode.FRIENDS)}
					>
						Friends
					</Button>
				</Col>
				<Container className={styles.cont_window}>
					{showContent === Mode.HISTORY && (
						<Col className={styles.fullWindowContent}>
							<GameHistoryList />
						</Col>
					)}
					{showContent === Mode.FRIENDS && (
						<Col className={styles.fullWindowContent}>
							{selectedFriend ? (
								<FriendProfile friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
							) : (
								<PotentialFriends friends={friends} onSelectFriend={handleFriendSelect} />
							)}
						</Col>
					)}
				</Container>
			</Row>
		</Container>
	);
};

export default Window;
