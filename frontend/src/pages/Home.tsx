import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import GameWindow from '../components/GameWindow';
import Window from '../components/Window';
import { Row, Col } from 'react-bootstrap';

const Home: React.FC = () => {
	return (
	<>
		<BarNav />
		<div id="page" className="d-flex align-items-center justify-content-center">
			<Row>
				<Col>
					<GameWindow />
				</Col>
				<Col>
					<Window />
				</Col>
			</Row>
		</div>
	</>);
};

export default Home;
