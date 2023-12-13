import React from 'react';
import '../App.css';
import BarNav from '../components/BarNav';
import Window from '../components/Window';

const Home: React.FC = () => {
	return (
    <>
		<BarNav />
		<div id="page">
			<Window />
		</div>
    </>
	);
};

export default Home;
