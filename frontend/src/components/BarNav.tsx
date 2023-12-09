import React, { useState } from 'react';
import { Navbar, Nav, Container, Image, Offcanvas, Row, Col } from 'react-bootstrap';

const BarNav: React.FC = () => {
  const [show, setShow] = useState(false);

  const handleToggle = () => setShow(!show);

  return (
    <Navbar bg="green" expand={false} style={{ flexWrap: 'nowrap', paddingLeft: '100px', marginTop: '60px'}}>
      <Container fluid>
        <Row className="w-100">
          <Col xs={true} className="d-flex justify-content-start">
            <Navbar.Brand style={{ color: 'var(--primary-color)' }}>Retroscendence</Navbar.Brand>
          </Col>
          <Col xs="auto" className="d-flex justify-content-end" style={{ paddingRight: '50px' }}>
            <Nav.Item>
              <Image 
                src="../public/img/Nino.png" 
                roundedCircle 
                style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                onClick={handleToggle}
              />
            </Nav.Item>
          </Col>
        </Row>

        <Navbar.Offcanvas 
          show={show} 
          onHide={() => setShow(false)} 
          placement="end"
        >
          <Offcanvas.Header closeButton style={{backgroundColor: 'black'}}>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body style={{backgroundColor: 'black'}}>
            {/* ajouter menu options*/}
            <Nav.Link href="#action1">Profile</Nav.Link>
            <Nav.Link href="#action2">Log Out</Nav.Link>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default BarNav;
