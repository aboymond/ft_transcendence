import React, { useState } from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Row, Col, CloseButton } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import Profile from './Profile';
import Friends from './Friends';

const BarNav: React.FC = () => {
	const [show, setShow] = useState(false);
	const auth = useAuth();
	const avatarUrl = auth.user?.avatar || '';

	const handleToggle = () => setShow(!show);

	return (
		<Navbar bg="green" expand={false} style={{ flexWrap: 'nowrap', paddingLeft: '100px', marginTop: '0px' }}>
			<Container fluid>
				<Row className="w-100">
					<Col xs={true} className="d-flex justify-content-start">
						<Navbar.Brand style={{ color: 'var(--primary-color)' }}>Retroscendence</Navbar.Brand>
					</Col>
					<Col xs="auto" className="d-flex justify-content-end" style={{ paddingRight: '50px' }}>
						<Nav.Item>
							<Image
								src={avatarUrl}
								roundedCircle
								style={{ width: '60px', height: '60px', cursor: 'pointer' }}
								onClick={handleToggle}
							/>
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
