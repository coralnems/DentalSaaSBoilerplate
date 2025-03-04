import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  useTheme
} from '@mui/material';
import { setUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface QRCodeAuthProps {
  onCancel: () => void;
}

interface QRSession {
  sessionId: string;
  qrUrl: string;
  pollInterval: number;
}

const QRCodeAuth: React.FC<QRCodeAuthProps> = ({ onCancel }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [session, setSession] = useState<QRSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startQRAuth = async () => {
      try {
        const response = await api.post('/auth/qr/start');
        setSession(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to start QR authentication');
        setLoading(false);
        dispatch(addNotification({
          message: 'Failed to start QR authentication',
          type: 'error'
        }));
      }
    };

    startQRAuth();
  }, [dispatch]);

  useEffect(() => {
    if (!session) return;

    const pollStatus = async () => {
      try {
        const response = await api.get(`/auth/qr/status/${session.sessionId}`);
        const { status, token, user } = response.data;

        if (status === 'completed' && token && user) {
          localStorage.setItem('token', token);
          dispatch(setUser(user));
          dispatch(addNotification({
            message: 'Successfully authenticated',
            type: 'success'
          }));
          navigate('/dashboard');
        }
      } catch (error) {
        setError('Failed to check authentication status');
        dispatch(addNotification({
          message: 'Failed to check authentication status',
          type: 'error'
        }));
      }
    };

    const interval = setInterval(pollStatus, session.pollInterval);
    return () => clearInterval(interval);
  }, [session, dispatch, navigate]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={3}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2" onClick={onCancel} sx={{ cursor: 'pointer', color: theme.palette.primary.main }}>
          Try another method
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom>
        Scan QR Code
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Open your Authentik app and scan this QR code to sign in
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 3,
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 1
        }}
      >
        {session && (
          <QRCodeSVG
            value={session.qrUrl}
            size={200}
            level="H"
            includeMargin
            bgColor={theme.palette.background.default}
            fgColor={theme.palette.text.primary}
          />
        )}
      </Box>
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
        Use another method
      </Typography>
    </Paper>
  );
};

export default QRCodeAuth; 