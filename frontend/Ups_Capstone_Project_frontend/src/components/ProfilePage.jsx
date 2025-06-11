import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
                User Profile
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                This is your profile page. Here you can view and manage your account details.
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/home')}
                sx={{ mr: 2 }}
            >
                Go to Home
            </Button>
            <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
            >
                Logout
            </Button>
            {/* Add more profile details and settings options here */}
        </Container>
    );
};

export default ProfilePage; 