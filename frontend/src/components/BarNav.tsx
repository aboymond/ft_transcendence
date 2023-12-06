import React, { useState } from 'react';
import { Navbar, Offcanvas, Nav, Container, Image } from 'react-bootstrap';
import styles from '../styles/BarNav.module.css';

const BarNav: React.FC = () => {
  const [show, setShow] = useState(false);

  const handleToggle = () => setShow(!show);

  return (
    <Navbar bg="light" expand={false}>
      <Container fluid>
        <Navbar.Brand className={styles.brand}>Retroscendence</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Item>
            <Nav.Link onClick={handleToggle}>
              <Image 
                src="../public/img/Nino.png" 
                roundedCircle 
                style={{ width: '60px', height: '60px' }}
                className={styles.image}
              />
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Navbar.Offcanvas 
          show={show} 
          onHide={() => setShow(false)} 
          placement="end"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {/* ajouter les options du menu*/}
            <Nav.Link href="#action1">Option 1</Nav.Link>
            <Nav.Link href="#action2">Option 2</Nav.Link>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default BarNav;
