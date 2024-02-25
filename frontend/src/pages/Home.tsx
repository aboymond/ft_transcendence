import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import GameWindow from '../components/GameWindow';
import Window from '../components/Window';
import { Row, Col, Container } from 'react-bootstrap';
import styles from '../styles/Home.module.css';
import { Link } from 'react-router-dom';
import SessionTimeout from '../components/SessionTimeout';

const Home: React.FC = () => {
	return (
		<>
			<SessionTimeout />
			<div id="homepage">
				<BarNav />
				<Container className={styles.container}>
					<Row className={styles.homerow}>
						<Col xs={6} md={6} lg={6} xl={6} xxl={6} className={styles.gamecol}>
							<GameWindow />
						</Col>
						<Col xs={6} md={6} lg={6} xl={6} xxl={6} className={styles.friendscol}>
							<Window />
						</Col>
					</Row>
				</Container>
				<div className={styles.credits}>
					<Link to="/credits" style={{ color: 'rgb(74, 246, 38)' }}>
						Credits
					</Link>
				</div>
			</div>
		</>
	);
};

export default Home;
