import { Container } from 'react-bootstrap';
import styles from '../styles/Logo.module.css' ;

function Logo() {
  return (
    <Container className={styles.containerLogo}>
      <h1 className={styles.logo}>RETROSCENDENCE</h1>
    </Container>
  );
}

export default Logo;
