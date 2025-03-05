import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { userAPI } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';

interface PatientPreferences {
  appointmentReminders: boolean;
  prescriptionRefillReminders: boolean;
  treatmentFollowUps: boolean;
  communicationMethod: string;
  allowSMS: boolean;
  allowEmail: boolean;
  allowPhone: boolean;
  shareDataWithDoctor: boolean;
  receiveNewsletters: boolean;
  language: string;
  accessibilityMode: boolean;
}

const PatientSettings: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState<PatientPreferences>({
    appointmentReminders: true,
    prescriptionRefillReminders: true,
    treatmentFollowUps: true,
    communicationMethod: 'email',
    allowSMS: true,
    allowEmail: true,
    allowPhone: false,
    shareDataWithDoctor: true,
    receiveNewsletters: false,
    language: 'english',
    accessibilityMode: false
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch current preferences from the API
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getPreferences();
        
        if (response.data) {
          // Use the patient preferences from the response
          setPreferences(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching patient preferences:', err);
        setError(err.response?.data?.message || 'Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences({
      ...preferences,
      [name]: checked
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      await userAPI.updatePreferences(preferences);
      
      setSuccess(true);
      dispatch(
        addNotification({
          message: 'Preferences updated successfully',
          type: 'success'
        })
      );
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      setError(err.response?.data?.message || 'Failed to update preferences');
      dispatch(
        addNotification({
          message: 'Failed to update preferences',
          type: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !preferences) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Patient Preferences
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Preferences updated successfully
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Communication Preferences</Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="communication-method-label">Preferred Communication Method</InputLabel>
              <Select
                labelId="communication-method-label"
                name="communicationMethod"
                value={preferences.communicationMethod}
                onChange={handleSelectChange}
                label="Preferred Communication Method"
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="sms">SMS</MenuItem>
                <MenuItem value="phone">Phone Call</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.allowEmail}
                  onChange={handleToggleChange}
                  name="allowEmail"
                  color="primary"
                />
              }
              label="Allow Email Communications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.allowSMS}
                  onChange={handleToggleChange}
                  name="allowSMS"
                  color="primary"
                />
              }
              label="Allow SMS Communications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.allowPhone}
                  onChange={handleToggleChange}
                  name="allowPhone"
                  color="primary"
                />
              }
              label="Allow Phone Call Communications"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Notification Settings</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.appointmentReminders}
                  onChange={handleToggleChange}
                  name="appointmentReminders"
                  color="primary"
                />
              }
              label="Appointment Reminders"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.prescriptionRefillReminders}
                  onChange={handleToggleChange}
                  name="prescriptionRefillReminders"
                  color="primary"
                />
              }
              label="Prescription Refill Reminders"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.treatmentFollowUps}
                  onChange={handleToggleChange}
                  name="treatmentFollowUps"
                  color="primary"
                />
              }
              label="Treatment Follow-up Reminders"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.receiveNewsletters}
                  onChange={handleToggleChange}
                  name="receiveNewsletters"
                  color="primary"
                />
              }
              label="Receive Newsletters and Updates"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Privacy & Data Settings</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.shareDataWithDoctor}
                  onChange={handleToggleChange}
                  name="shareDataWithDoctor"
                  color="primary"
                />
              }
              label="Share Medical Data with Doctors"
            />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 3, mb: 2 }}>
              Allow doctors to access your medical history, test results, and treatment records.
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Display Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="language-label">Preferred Language</InputLabel>
                  <Select
                    labelId="language-label"
                    name="language"
                    value={preferences.language}
                    onChange={handleSelectChange}
                    label="Preferred Language"
                  >
                    <MenuItem value="english">English</MenuItem>
                    <MenuItem value="spanish">Spanish</MenuItem>
                    <MenuItem value="french">French</MenuItem>
                    <MenuItem value="german">German</MenuItem>
                    <MenuItem value="chinese">Chinese</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={preferences.accessibilityMode}
                        onChange={handleToggleChange}
                        name="accessibilityMode"
                        color="primary"
                      />
                    }
                    label="Enable Accessibility Mode"
                  />
                </Box>
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
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PatientSettings; 