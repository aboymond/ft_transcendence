import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const TwoFA: React.FC = () => {
    const [userProfile, setUserProfile] = useState<any | null>(null); 
    const [isTwoFAToggled, setIsTwoFAToggled] = useState<boolean>(false); 

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await apiService.getUserProfile(); 
                setUserProfile(profile);
                setIsTwoFAToggled(profile?.twofa || false);
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        localStorage.setItem('isTwoFAToggled', JSON.stringify(isTwoFAToggled));
    }, [isTwoFAToggled]);

    const handleTwoFAToggle = () => {
        const newToggleState = !isTwoFAToggled;
        setIsTwoFAToggled(newToggleState);
        apiService.twoFAEnabling(newToggleState);
    };

    return (
        <div>
            <button onClick={handleTwoFAToggle} style={{
                                    backgroundColor: isTwoFAToggled ? 'green' : 'grey',
                                    display: 'inline-block',
									padding: '4px',
									border: 'solid',
									borderColor: 'var(--accent-color)', 
                                    fontSize: '14px', 
                                    cursor: 'pointer' }}>
                {isTwoFAToggled ? '2FA ON' : '2FA OFF'}
            </button>
        </div>
    );
};

export default TwoFA;
