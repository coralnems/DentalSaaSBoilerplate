import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import LoginForm from '../../components/LoginForm';

const Login: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Dental Clinic
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Sign in to access your account
        </Typography>
      </Box>
      
      <LoginForm />
    </Container>
  );
};

export default Login; 