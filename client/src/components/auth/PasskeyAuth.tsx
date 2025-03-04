import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  startRegistration,
  startAuthentication
} from '@simplewebauthn/browser';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  useTheme
} from '@mui/material';
import { setUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface PasskeyAuthProps {
  mode: 'register' | 'authenticate';
  email?: string;
  onCancel: () => void;
}

const PasskeyAuth: React.FC<PasskeyAuthProps> = ({ mode, email, onCancel }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get registration options from server
      const optionsResponse = await api.post('/auth/webauthn/register/start');
      const options = optionsResponse.data;

      // Create credentials
      const credential = await startRegistration(options);

      // Send credentials to server for verification
      await api.post('/auth/webauthn/register/complete', credential);

      dispatch(addNotification({
        message: 'Passkey registered successfully',
        type: 'success'
      }));

      onCancel();
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register passkey');
      dispatch(addNotification({
        message: 'Failed to register passkey',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get authentication options from server
      const optionsResponse = await api.post('/auth/webauthn/login/start', { email });
      const { options, userId } = optionsResponse.data;

      // Get credentials
      const credential = await startAuthentication(options);

      // Send credentials to server for verification
      const response = await api.post('/auth/webauthn/login/complete', {
        userId,
        credential
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      dispatch(addNotification({
        message: 'Successfully authenticated',
        type: 'success'
      }));

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.response?.data?.message || 'Authentication failed');
      dispatch(addNotification({
        message: 'Authentication failed',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAction = mode === 'register' ? handleRegister : handleAuthenticate;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        {mode === 'register' ? 'Register Passkey' : 'Sign in with Passkey'}
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        {mode === 'register'
          ? 'Add a passkey to your account for passwordless authentication'
          : 'Use your passkey to sign in securely'}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        variant="contained"
        onClick={handleAction}
        fullWidth
        sx={{ mb: 2 }}
      >
        {mode === 'register' ? 'Register Passkey' : 'Continue with Passkey'}
      </Button>

      <Typography
        variant="body2"
        onClick={onCancel}
        sx={{
          cursor: 'pointer',
          color: theme.palette.primary.main,
          '&:hover': {
            textDecoration: 'underline'
          }
        }}
      >
        {mode === 'register' ? 'Skip for now' : 'Use another method'}
      </Typography>
    </Paper>
  );
};

export default PasskeyAuth; 