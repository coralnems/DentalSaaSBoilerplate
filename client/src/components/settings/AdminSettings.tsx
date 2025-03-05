import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Switch, 
  FormControlLabel, 
  Button, 
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { userAPI } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';

interface SystemSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
  backupFrequency: string;
}

const AdminSettings: React.FC = () => {
  const dispatch = useDispatch();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    backupFrequency: 'daily'
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch current system settings from the API
    const fetchSystemSettings = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getPreferences();
        
        if (response.data) {
          // Use the admin preferences from the response
          setSystemSettings(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching system settings:', err);
        setError(err.response?.data?.message || 'Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemSettings();
  }, []);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: checked
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: name === 'backupFrequency' ? value : Number(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await userAPI.updatePreferences(systemSettings);
      
      setSuccess(true);
      dispatch(
        addNotification({
          message: 'System settings updated successfully',
          type: 'success'
        })
      );
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating system settings:', err);
      setError(err.response?.data?.message || 'Failed to update system settings');
      dispatch(
        addNotification({
          message: 'Failed to update system settings',
          type: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !systemSettings) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Admin System Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          System settings updated successfully
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">System Status</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onChange={handleToggleChange}
                  name="maintenanceMode"
                  color="primary"
                />
              }
              label="Maintenance Mode"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, mb: 2 }}>
              When enabled, only administrators can access the system. All other users will see a maintenance message.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>User Registration</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.allowRegistration}
                  onChange={handleToggleChange}
                  name="allowRegistration"
                  color="primary"
                />
              }
              label="Allow New User Registration"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.requireEmailVerification}
                  onChange={handleToggleChange}
                  name="requireEmailVerification"
                  color="primary"
                />
              }
              label="Require Email Verification"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Login Attempts"
              name="maxLoginAttempts"
              type="number"
              value={systemSettings.maxLoginAttempts}
              onChange={handleInputChange}
              variant="outlined"
              InputProps={{ inputProps: { min: 3, max: 10 } }}
              helperText="Number of failed login attempts before account lockout (3-10)"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Session Timeout (minutes)"
              name="sessionTimeout"
              type="number"
              value={systemSettings.sessionTimeout}
              onChange={handleInputChange}
              variant="outlined"
              InputProps={{ inputProps: { min: 5, max: 120 } }}
              helperText="User session timeout in minutes (5-120)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>System Maintenance</Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Database Backup Frequency"
                  name="backupFrequency"
                  value={systemSettings.backupFrequency}
                  onChange={handleInputChange as any}
                  variant="outlined"
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Button 
                  variant="outlined" 
                  color="primary"
                  sx={{ mt: { xs: 1, md: 0 } }}
                >
                  Create Backup Now
                </Button>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AdminSettings; 