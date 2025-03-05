import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { userAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Fetch the current 2FA status
    const fetchSecuritySettings = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getSecuritySettings();
        
        if (response.data && response.data.data) {
          setTwoFactorEnabled(response.data.data.twoFactorEnabled || false);
        }
      } catch (err: any) {
        console.error('Error fetching security settings:', err);
        dispatch(
          addNotification({
            message: 'Failed to load security settings',
            type: 'error',
          })
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSecuritySettings();
  }, [dispatch]);

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleTwoFactorChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const isEnabled = e.target.checked;
      
      await userAPI.updateTwoFactorAuth(isEnabled);
      
      setTwoFactorEnabled(isEnabled);
      
      dispatch(
        addNotification({
          message: isEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
          type: 'success',
        })
      );
    } catch (err: any) {
      console.error('Error updating 2FA settings:', err);
      dispatch(
        addNotification({
          message: 'Failed to update two-factor authentication settings',
          type: 'error',
        })
      );
      // Reset switch to previous state
      setTwoFactorEnabled(!e.target.checked);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await userAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      dispatch(
        addNotification({
          message: 'Password updated successfully',
          type: 'success',
        })
      );
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
      dispatch(
        addNotification({
          message: 'Failed to update password',
          type: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Security Settings
      </Typography>
      
      {/* Password Change Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Change Password
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
            Password updated successfully
          </Alert>
        )}
        
        <form onSubmit={handleSubmitPassword}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
                variant="outlined"
                required
                helperText="Password must be at least 8 characters long"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
                variant="outlined"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      {/* Two-Factor Authentication Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Two-Factor Authentication
        </Typography>
        
        <FormControlLabel
          control={
            <Switch 
              checked={twoFactorEnabled} 
              onChange={handleTwoFactorChange} 
              color="primary"
            />
          }
          label="Enable Two-Factor Authentication"
        />
        
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Two-factor authentication adds an extra layer of security to your account. When enabled, you'll
          need to provide a verification code along with your password when signing in.
        </Typography>
      </Box>
      
      {twoFactorEnabled && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" gutterBottom>
            To complete the setup, you would need to:
          </Typography>
          <ol>
            <li>Install an authenticator app on your phone (Google Authenticator, Authy, etc.)</li>
            <li>Scan the QR code that would be provided here</li>
            <li>Enter the verification code from the app to confirm setup</li>
          </ol>
          <Typography variant="body2">
            This is a placeholder. In a real application, this would be implemented with actual
            two-factor authentication functionality.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default SecuritySettings; 