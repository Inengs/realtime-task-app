// EmailVerificationPage.js
import { useState, useEffect } from 'react';
import Button from '../../components/Common/Button';
import api from '../../services/api';

// Simple envelope icon using emoji (replace with SVG or image for production)
const EnvelopeIcon = () => (
    <div style={{ fontSize: '120px', color: '#4CAF50', marginBottom: '20px' }}>
        ✉️
    </div>
);

const EmailVerificationPage = () => {
    const [message, setMessage] = useState('Check Your Email');
    const [error, setError] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Extract token from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            verifyEmail(tokenFromUrl);
        }
    }, []);

    const verifyEmail = async (token) => {
        try {
            const response = await api.get(`/auth/verify-email?token=${token}`);
            setMessage(response.data.message || 'Email verified successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        try {
            // Assuming you have a resend endpoint or logic to trigger resend
            const response = await api.post('/auth/register/resend', { email: 'user@example.com' }); // Replace with actual email
            setMessage(response.data.message || 'Verification email resent. Please check your inbox.');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend verification email.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f0f0f0',
            fontFamily: 'Arial, sans-serif',
        }}>
            <EnvelopeIcon />
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                maxWidth: '300px',
            }}>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>{message}</h2>
                {error && <p style={{ color: 'red', margin: '0 0 20px 0', fontSize: '14px' }}>{error}</p>}
                {!token && (
                    <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666' }}>
                        We've sent a verification link to your email address. Please check your inbox and click on the link to verify your account.
                    </p>
                )}
                <Button text="Resend Verification Email" onClick={handleResend} />
            </div>
        </div>
    );
};

export default EmailVerificationPage;