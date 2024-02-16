import React from 'react';
import styles from '../styles/CreditsPage.module.css';

const Credits: React.FC = () => {
    return (
        <div id="page">
                <video className={styles.size} autoPlay loop>
                    <source src="./video/Credits.mp4" type="video/mp4" />
                </video>
                <div className={styles.overlay}>
                    <img src="./img/tel.png" alt="Téléphone" />
                </div>
            </div>
    );
};

export default Credits;