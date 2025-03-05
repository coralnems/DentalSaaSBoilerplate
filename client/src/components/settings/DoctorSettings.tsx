import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { userAPI } from '../../services/api';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';

interface DoctorPreferences {
  appointmentReminders: boolean;
  appointmentBuffer: number;
  defaultAppointmentDuration: number;
  notifyOnNewAppointment: boolean;
  notifyOnCancellation: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  availableDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
}

const DoctorSettings: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [preferences, setPreferences] = useState<DoctorPreferences>({
    appointmentReminders: true,
    appointmentBuffer: 15,
    defaultAppointmentDuration: 30,
    notifyOnNewAppointment: true,
    notifyOnCancellation: true,
    smsNotifications: false,
    emailNotifications: true,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00'
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
          // Use the doctor preferences from the response
          setPreferences(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching doctor preferences:', err);
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

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferences({
      ...preferences,
      [name]: value
    });
  };

  const handleDaysChange = (e: SelectChangeEvent<string[]>) => {
    const { value } = e.target;
    setPreferences({
      ...preferences,
      availableDays: typeof value === 'string' ? value.split(',') : value
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
        Doctor Preferences
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
            <Typography variant="subtitle1">Appointment Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Appointment Duration (minutes)"
                  name="defaultAppointmentDuration"
                  type="number"
                  value={preferences.defaultAppointmentDuration}
                  onChange={handleNumberInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 10, max: 120, step: 5 } }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Buffer Between Appointments (minutes)"
                  name="appointmentBuffer"
                  type="number"
                  value={preferences.appointmentBuffer}
                  onChange={handleNumberInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0, max: 60, step: 5 } }}
                  margin="normal"
                />
              </Grid>
            </Grid>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.appointmentReminders}
                  onChange={handleToggleChange}
                  name="appointmentReminders"
                  color="primary"
                />
              }
              label="Send appointment reminders to patients"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Schedule Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="available-days-label">Available Days</InputLabel>
                  <Select
                    labelId="available-days-label"
                    multiple
                    value={preferences.availableDays}
                    onChange={handleDaysChange}
                    label="Available Days"
                  >
                    <MenuItem value="monday">Monday</MenuItem>
                    <MenuItem value="tuesday">Tuesday</MenuItem>
                    <MenuItem value="wednesday">Wednesday</MenuItem>
                    <MenuItem value="thursday">Thursday</MenuItem>
                    <MenuItem value="friday">Friday</MenuItem>
                    <MenuItem value="saturday">Saturday</MenuItem>
                    <MenuItem value="sunday">Sunday</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Working Hours Start"
                  name="workingHoursStart"
                  type="time"
                  value={preferences.workingHoursStart}
                  onChange={handleTimeChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Working Hours End"
                  name="workingHoursEnd"
                  type="time"
                  value={preferences.workingHoursEnd}
                  onChange={handleTimeChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1">Notification Settings</Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifyOnNewAppointment}
                  onChange={handleToggleChange}
                  name="notifyOnNewAppointment"
                  color="primary"
                />
              }
              label="Notify me when a new appointment is booked"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.notifyOnCancellation}
                  onChange={handleToggleChange}
                  name="notifyOnCancellation"
                  color="primary"
                />
              }
              label="Notify me when an appointment is canceled"
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

export default DoctorSettings; 