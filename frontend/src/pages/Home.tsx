import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';
// import Logo from '../components/Logo';
// import GameWindow from '../components/GameWindow';
// import Menu from '../components/Menu';
// import History from '../components/History';
// import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
	return (
		<div id="page">
		<Navbar />
      <Container fluid>
      </Container>
    </div>
	);
};

export default Home;
