import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const TwoFA: React.FC = () => {
    const [isTwoFAToggled, setIsTwoFAToggled] = useState(() => {
        const savedState = localStorage.getItem('isTwoFAToggled');
        return savedState !== null ? JSON.parse(savedState) : false;
    });

    // Effect hook to save state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('isTwoFAToggled', JSON.stringify(isTwoFAToggled));
    }, [isTwoFAToggled]);

    // Function to handle toggle
    const handleTwoFAToggle = () => {
        setIsTwoFAToggled(!isTwoFAToggled);
        apiService.twoFAEnabling(isTwoFAToggled);
    };

    return (
        <div>
            {/* Toggle button */}
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
