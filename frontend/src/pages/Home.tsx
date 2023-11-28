import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../App.css';
import Logo from '../components/Logo';
import GameWindow from '../components/GameWindow';
import Menu from '../components/Menu';
import History from '../components/History';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
	return (
		<div id="page">
		<Navbar />
      <div id="image-container">
        <img src="./img/light.png" alt="Light" id="light" />
        <img src="./img/scanlines.png" alt="Scanlines" id="scan" />
        <img src="./img/bezel.png" alt="Bezel" id="bezel" />
      </div>
      <Container fluid>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <div className="logo">
              <Logo />
            </div>
          </Col>
        </Row>
        <Row>
          <Col md="auto">
            <div id="p-end">
              <h4>It's now the end of the game!</h4>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={3} lg={2}>
            <Menu />
          </Col>
          <Col xs={12} md={6} lg={8}>
            <GameWindow />
          </Col>
          <Col xs={12} md={3} lg={2}>
            <History />
          </Col>
        </Row>
        <Footer />
      </Container>
    </div>
	);
};

export default Home;
