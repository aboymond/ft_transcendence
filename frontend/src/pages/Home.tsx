import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import GameWindow from '../components/GameWindow';
import Window from '../components/Window';
import { Row, Col, Container } from 'react-bootstrap';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
	return (
	<>
		<div id="homepage" >
		<BarNav />
			<Container className={styles.container}>
				<Row className={styles.homerow}>
					<Col xs={7} md={7} lg={7} xl={7} xxl={7} className={styles.gamecol}>
						<GameWindow />
					</Col>
					<Col xs={5} md={5} lg={5} xl={5} xxl={5} className={styles.friendscol}>
						<Window />
					</Col>
				</Row>
			</Container>

		</div>
	</>);
};

export default Home;
