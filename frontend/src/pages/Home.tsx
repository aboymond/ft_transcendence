import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import GameWindow from '../components/GameWindow';

const Home: React.FC = () => {
	return (
	<>
		<BarNav />
		<div id="page">
			<GameWindow />
		</div>
	</>);
};

export default Home;
