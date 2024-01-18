import React, { useState } from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Row, Col, CloseButton } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import Profile from './Profile';
import Friends from './Friends';
import styles from '../styles/BarNav.module.css'

const BarNav: React.FC = () => {
	const [show, setShow] = useState(false);
	const auth = useAuth();
	const avatarUrl = auth.user?.avatar || '';

	const handleToggle = () => setShow(!show);

	return (
		<Navbar bg="green" expand={false} style={{ flexWrap: 'nowrap', paddingLeft: '0vw', paddingRight: '0vw', marginTop: '8vh', }}>
			<Container fluid>
				<Row className="w-100">
					<Col xs={true} className="d-flex justify-content-start" style={{ paddingLeft: '9vw' }}>
						<Navbar.Brand style={{ color: 'var(--primary-color)', fontSize: '1.6em' }}>RETROSCENDENCE</Navbar.Brand>
					</Col>
					<Col xs="auto" className="d-flex justify-content-end" style={{ paddingRight: '5vw' }}>
						<Nav.Item>
							<Image
								className={styles.avatar}
								src={avatarUrl}
								roundedCircle
								style={{ width: '60px', height: '60px', cursor: 'pointer'}}
								onClick={handleToggle}
							>
							</ Image>
						</Nav.Item>
					</Col>
				</Row>

				<Navbar.Offcanvas show={show} onHide={() => setShow(false)} placement="end">
					<Offcanvas.Header style={{ backgroundColor: 'black', display: 'flex', justifyContent: 'center', position: 'relative' }}>
						<Image
							src={avatarUrl}
							roundedCircle
							style={{ width: '60px', height: '60px', cursor: 'pointer' }}
						/>
						<CloseButton onClick={() => setShow(false)} style={{ backgroundColor: 'var(--primary-color)', position: 'absolute', right: '20px' }} />
					</Offcanvas.Header>
					<Offcanvas.Body style={{ backgroundColor: 'black' }}>
						<Profile />
						<Friends />
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
							<Nav.Link onClick={auth.logout}>Log Out</Nav.Link>
						</div>
						{/* <Nav.Link onClick={auth.logout}>Log Out</Nav.Link> */}
					</Offcanvas.Body>
				</Navbar.Offcanvas>
			</Container>
		</Navbar>
	);
};

export default BarNav;
