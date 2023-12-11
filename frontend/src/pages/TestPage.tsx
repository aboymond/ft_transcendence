// frontend/src/pages/TestPage.tsx
import React, { useState } from 'react';
import { Container, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import '../App.css';
import GameHistoryList from '../components/GameHistoryList';
import Profile from '../components/Profile';
import Friends from '../components/Friends';
import GameWindow from '../components/GameWindow';
import TestNavbar from '../components/TestNavbar';

const TestPage: React.FC = () => {
	const [activeComponent, setActiveComponent] = useState<'history' | 'profile' | 'friends' | 'game'>(
		'history',
	);

	return (
		<div id="page">
			<TestNavbar />
			<Container fluid>
				<Row>
					<Col xs={12}>
						<DropdownButton
							id="dropdown-basic-button"
							title={activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1)}
						>
							<Dropdown.Item onClick={() => setActiveComponent('history')}>History</Dropdown.Item>
							<Dropdown.Item onClick={() => setActiveComponent('profile')}>Profile</Dropdown.Item>
							<Dropdown.Item onClick={() => setActiveComponent('friends')}>Friends</Dropdown.Item>
							<Dropdown.Item onClick={() => setActiveComponent('game')}>Game</Dropdown.Item>
						</DropdownButton>
					</Col>
				</Row>

				{activeComponent === 'history' && <GameHistoryList />}
				{activeComponent === 'profile' && <Profile />}
				{activeComponent === 'friends' && <Friends />}
				{activeComponent === 'game' && <GameWindow />}
			</Container>
		</div>
	);
};

export default TestPage;
