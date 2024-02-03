import React, { useState } from 'react';

const TwoFA: React.FC = () => {
    // State variable to track toggle status, initialized to false
    const [isTwoFAToggled, setIsTwoFAToggled] = useState(false);

    // Function to handle toggle
    const handleTwoFAToggle = () => {
        setIsTwoFAToggled(!isTwoFAToggled);
    };

    return (
        <div>
            {/* Toggle button */}
            <button onClick={handleTwoFAToggle} style={{
                                    backgroundColor: 'black',
                                    display: 'inline-block',
									padding: '5px',
									border: 'solid',
									borderColor: 'var(--accent-color)', 
                                    fontSize: '16px', 
                                    cursor: 'pointer' }}>
                {isTwoFAToggled ? '2FA ON' : '2FA OFF'}
            </button>
        </div>
    );
};

export default TwoFA;
