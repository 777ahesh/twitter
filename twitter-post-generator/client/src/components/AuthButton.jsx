import React, { useState } from 'react';
import { initiateTwitterAuth } from '../services/api';

const AuthButton = () => {
    const [loading, setLoading] = useState(false);

    const handleAuth = async () => {
        setLoading(true);
        try {
            const { authUrl } = await initiateTwitterAuth();
            // Redirect user to Twitter authorization page
            window.location.href = authUrl;
        } catch (error) {
            alert('Error initiating authentication: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <div className="auth-section">
            <h2>Connect Your Twitter Account</h2>
            <p>To post tweets, you need to authenticate with Twitter first.</p>
            <button 
                onClick={handleAuth} 
                disabled={loading}
                className="auth-button"
            >
                {loading ? 'Redirecting...' : 'Connect Twitter Account'}
            </button>
        </div>
    );
};

export default AuthButton;