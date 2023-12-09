// frontend/src/pages/TestPage.tsx
import React, { useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import '../App.css';
import GameHistoryList from '../components/GameHistoryList';
import Profile from '../components/Profile';
import FriendsPage from './FriendsPage';
import GameWindow from '../components/GameWindow';

const TestPage: React.FC = () => {
	const [activeComponent, setActiveComponent] = useState<'history' | 'profile' | 'friends' | 'game'>(
		'history',
	);

	return (
		<div id="page">
			<Container fluid>
				<Row>
					<Col xs={4}>
						<Button style={{ width: '100%' }} onClick={() => setActiveComponent('history')}>
							History
						</Button>
					</Col>
					<Col xs={4}>
						<Button style={{ width: '100%' }} onClick={() => setActiveComponent('profile')}>
							Profile
						</Button>
					</Col>
					<Col xs={4}>
						<Button style={{ width: '100%' }} onClick={() => setActiveComponent('friends')}>
							Friends
						</Button>
					</Col>
					<Col xs={4}>
						<Button style={{ width: '100%' }} onClick={() => setActiveComponent('game')}>
							Game
						</Button>
					</Col>
				</Row>

				{activeComponent === 'history' && <GameHistoryList />}
				{activeComponent === 'profile' && <Profile />}
				{activeComponent === 'friends' && <FriendsPage />}
				{activeComponent === 'game' && <GameWindow />}
			</Container>
		</div>
	);
};

export default TestPage;
