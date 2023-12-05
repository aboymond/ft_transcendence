import { Navbar, Nav } from 'react-bootstrap';
import styles from '../styles/Header.module.css';

function Header() {
  return (
    <Navbar className={styles.header} fixed="top" expand="lg">
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto"> 
          <Nav.Link href="#">Sign in</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
