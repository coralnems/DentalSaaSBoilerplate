import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/joy';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmail() {
  const [error, setError] = useState('');
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    verifyEmail(token).catch((err) => {
      setError(err.message || 'Failed to verify email');
    });
  }, [token, verifyEmail, navigate]);

  return (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      {error ? (
        <Typography color="danger">{error}</Typography>
      ) : (
        <>
          <CircularProgress />
          <Typography level="h4" mt={2}>
            Verifying your email...
          </Typography>
        </>
      )}
    </Box>
  );
} 