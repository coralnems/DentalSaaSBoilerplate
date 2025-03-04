import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import { useAuth } from '../../hooks/useAuth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await resetPassword(token || '', password);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <Sheet
        sx={{
          width: 300,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography level="h4">Reset Password</Typography>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </FormControl>
          {error && (
            <Typography color="danger" fontSize="sm">
              {error}
            </Typography>
          )}
          <Button type="submit" fullWidth sx={{ mt: 2 }}>
            Reset Password
          </Button>
        </form>
      </Sheet>
    </Box>
  );
} 