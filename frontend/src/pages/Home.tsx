import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import GameWindow from '../components/GameWindow';
import Window from '../components/Window';
import { Row, Col } from 'react-bootstrap';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
	return (
	<>
		<BarNav />
		<div id="homepage" >
				<Col className={styles.gamecol}>
					<GameWindow />
				</Col>
				<Col className={styles.friendscol}>
					<Window />
				</Col>
		</div>
	</>);
};

export default Home;
