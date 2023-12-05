import { Nav } from 'react-bootstrap';
import styles from '../styles/Menu.module.css';

function Menu() {
  return (
    <Nav className={styles.menu} variant="pills" defaultActiveKey="/play" as="ul">
      <Nav.Item as="li">
        <Nav.Link href="play">PLAY</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link href="chatbox">CHATBOX</Nav.Link>
      </Nav.Item>
      <Nav.Item as="li">
        <Nav.Link href="help">HELP</Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default Menu;
