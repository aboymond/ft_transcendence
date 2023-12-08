// frontend/src/pages/HomePage.tsx
import React, { useState } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import '../App.css';
import GameHistoryList from '../components/GameHistoryList';
import Profile from '../components/Profile';
import FriendsPage from './FriendsPage';

const HomePage: React.FC = () => {
	const [activeComponent, setActiveComponent] = useState<'history' | 'profile' | 'friends'>('history');

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
				</Row>

				{activeComponent === 'history' && <GameHistoryList />}
				{activeComponent === 'profile' && <Profile />}
				{activeComponent === 'friends' && <FriendsPage />}
			</Container>
		</div>
	);
};

export default HomePage;
