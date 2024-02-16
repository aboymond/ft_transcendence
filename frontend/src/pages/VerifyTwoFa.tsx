import React, { useState } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/apiService';
import { Navbar, Row, Col, Container } from 'react-bootstrap';
import styles from '../styles/VerifyTwoFa.module.css';
import { Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const VerifyTwoFa: React.FC = () => {
    const [otp, setotp] = useState('');
    const [codeValidated, setcodeValidated] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const auth = useAuth();


    const handleClose = () => {
        auth.logout()
		navigate('/')
	};

    const handleVerifyOtp = async (event: React.FormEvent) => {
        event.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
		const username = urlParams.get('username') || '';
        console.log(username);
        try {
            const data = await apiService.verifyOtp(username, otp);
            auth.login(data.access, data.user, data.user.twofa);
			navigate('/home');
		} catch (error) {
			setError('2FA failed. Please check your code.');
		}
	};

	return (
        <Navbar
			bg="green"
			expand={false}
			style={{ flexWrap: 'nowrap', paddingLeft: '0vw', paddingRight: '0vw', marginTop: '8vh' }}
		>
        <div id="homepage">
           <Row className="w-100">
					<Col xs={true} className="d-flex justify-content-start" style={{ paddingLeft: '9vw' }}>
						<Navbar.Brand style={{ color: 'var(--primary-color)', fontSize: '1.6em' }}>
							RETROSCENDENCE
						</Navbar.Brand>
					</Col>
					<Col xs="auto" className="d-flex justify-content-end" style={{ paddingRight: '5vw' }}>
					</Col>
				</Row>
            <form onSubmit={handleVerifyOtp}className={styles.VerifyForm}>
            <Button
                variant="light"
                onClick={() => handleClose()}
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 90,
                    backgroundColor: 'var(--primary-color) ',
                    borderColor: 'var(--accent-color)',
                    width: 'auto',
                }}
            >
                &times;
            </Button>
            <h1 className={styles.title}>Enter the code you received by email:</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input
                type="text"
                value={otp}
                onChange={(e) => setotp(e.target.value)}
                placeholder="OTP"
                className={styles.inputField}
            />
            <button type="submit" className={styles.verifyButton}> 
                Verify
            </button>
        </form>
        </div>
        </Navbar>
);
};

export default VerifyTwoFa;