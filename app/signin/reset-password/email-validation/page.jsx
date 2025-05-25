import React from 'react';

const EmailValidation = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
            <h1>Password Reset Email Sent</h1>
            <p>We have sent a link to your email address to reset your password. Please check your inbox and follow the instructions.</p>
            <p>If you don’t see the email, please check your spam or junk folder.</p>
        </div>
    );
};

export default EmailValidation;