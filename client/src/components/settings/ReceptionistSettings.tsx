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

interface ReceptionistPreferences {
  appointmentNotifications: boolean;
  patientCheckInNotifications: boolean;
  lowInventoryAlerts: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  defaultView: string;
  calendarView: string;
  scheduleBuffer: number;
  autoSendAppointmentReminders: boolean;
  reminderLeadTime: number;
}

const ReceptionistSettings: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState<ReceptionistPreferences>({
    appointmentNotifications: true,
    patientCheckInNotifications: true,
    lowInventoryAlerts: false,
    smsNotifications: false,
    emailNotifications: true,
    desktopNotifications: true,
    defaultView: 'calendar',
    calendarView: 'week',
    scheduleBuffer: 10,
    autoSendAppointmentReminders: true,
    reminderLeadTime: 24
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
          // Use the receptionist preferences from the response
          setPreferences(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching receptionist preferences:', err);
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

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: Number(value)
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
        Receptionist Preferences
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
            <Typography variant="subtitle1">Dashboard & Calendar Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="default-view-label">Default Dashboard View</InputLabel>
                  <Select
                    labelId="default-view-label"
                    name="defaultView"
                    value={preferences.defaultView}
                    onChange={handleSelectChange}
                    label="Default Dashboard View"
                  >
                    <MenuItem value="calendar">Calendar</MenuItem>
                    <MenuItem value="appointments">Appointments List</MenuItem>
                    <MenuItem value="patients">Patients List</MenuItem>
                    <MenuItem value="billing">Billing</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="calendar-view-label">Default Calendar View</InputLabel>
                  <Select
                    labelId="calendar-view-label"
                    name="calendarView"
                    value={preferences.calendarView}
                    onChange={handleSelectChange}
                    label="Default Calendar View"
                  >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Scheduling Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Schedule Buffer (minutes)"
                  name="scheduleBuffer"
                  type="number"
                  value={preferences.scheduleBuffer}
                  onChange={handleNumberInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 60, step: 5 } }}
                  margin="normal"
                  helperText="Buffer time between appointments"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reminder Lead Time (hours)"
                  name="reminderLeadTime"
                  type="number"
                  value={preferences.reminderLeadTime}
                  onChange={handleNumberInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1, max: 72 } }}
                  margin="normal"
                  helperText="How many hours before appointment to send reminders"
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.autoSendAppointmentReminders}
                  onChange={handleToggleChange}
                  name="autoSendAppointmentReminders"
                  color="primary"
                />
              }
              label="Automatically send appointment reminders"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Notification Settings</Typography>
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Notification Types
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.appointmentNotifications}
                  onChange={handleToggleChange}
                  name="appointmentNotifications"
                  color="primary"
                />
              }
              label="New/Changed Appointment Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.patientCheckInNotifications}
                  onChange={handleToggleChange}
                  name="patientCheckInNotifications"
                  color="primary"
                />
              }
              label="Patient Check-in Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.lowInventoryAlerts}
                  onChange={handleToggleChange}
                  name="lowInventoryAlerts"
                  color="primary"
                />
              }
              label="Low Inventory Alerts"
            />
            
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Notification Methods
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={handleToggleChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications}
                  onChange={handleToggleChange}
                  name="smsNotifications"
                  color="primary"
                />
              }
              label="SMS Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.desktopNotifications}
                  onChange={handleToggleChange}
                  name="desktopNotifications"
                  color="primary"
                />
              }
              label="Desktop Notifications"
            />
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

export default ReceptionistSettings; 