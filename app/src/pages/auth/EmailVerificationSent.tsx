import React from 'react';
import { Box, Typography, Button } from '@mui/joy';
import { Link } from 'react-router-dom';

export default function EmailVerificationSent() {
  return (
    <Box sx={{ textAlign: 'center', p: 4 }}>
      <Typography level="h4" mb={2}>
        Verification Email Sent
      </Typography>
      <Typography mb={3}>
        Please check your email inbox and click the verification link to complete your registration.
      </Typography>
      <Button component={Link} to="/login">
        Return to Login
      </Button>
    </Box>
  );
} 