import { Container } from 'react-bootstrap';
// import { Link } from 'react-router-dom'; 
import styles from '../styles/Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.credits}>
          {/* <Link to="/credits">credits</Link> */}
          <a href="#">credits</a>
          </div>
      </Container>
    </footer>
  );
}

export default Footer;
