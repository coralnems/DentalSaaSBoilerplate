import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface ClinicSettings {
  clinicName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  businessHours: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday: { start: string; end: string };
  };
  appointmentSettings: {
    defaultDuration: number;
    bufferTime: number;
    maxAdvanceBookingDays: number;
    reminderLeadTime: number;
  };
  notifications: {
    enableEmailReminders: boolean;
    enableSMSReminders: boolean;
    reminderTemplate: string;
  };
}

const defaultSettings: ClinicSettings = {
  clinicName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  contact: {
    phone: '',
    email: '',
    website: ''
  },
  businessHours: {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '13:00' },
    sunday: { start: '', end: '' }
  },
  appointmentSettings: {
    defaultDuration: 30,
    bufferTime: 10,
    maxAdvanceBookingDays: 60,
    reminderLeadTime: 24
  },
  notifications: {
    enableEmailReminders: true,
    enableSMSReminders: false,
    reminderTemplate: 'Dear {patientName}, this is a reminder for your appointment on {date} at {time} with Dr. {dentistName}.'
  }
};

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState<ClinicSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch settings',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/settings', settings);
      dispatch(addNotification({
        message: 'Settings saved successfully',
        type: 'success'
      }));
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to save settings',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof ClinicSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Clinic Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          General Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Clinic Name"
              value={settings.clinicName}
              onChange={(e) => setSettings(prev => ({ ...prev, clinicName: e.target.value }))}
            />
          </Grid>
        </Grid>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Address
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street"
              value={settings.address.street}
              onChange={(e) => handleChange('address', 'street', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              value={settings.address.city}
              onChange={(e) => handleChange('address', 'city', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              value={settings.address.state}
              onChange={(e) => handleChange('address', 'state', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              value={settings.address.zipCode}
              onChange={(e) => handleChange('address', 'zipCode', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Country"
              value={settings.address.country}
              onChange={(e) => handleChange('address', 'country', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={settings.contact.phone}
              onChange={(e) => handleChange('contact', 'phone', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={settings.contact.email}
              onChange={(e) => handleChange('contact', 'email', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Website"
              value={settings.contact.website}
              onChange={(e) => handleChange('contact', 'website', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Business Hours
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(settings.businessHours).map(([day, hours]) => (
            <Grid item xs={12} sm={6} key={day}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Start Time"
                    value={hours.start}
                    onChange={(e) => handleChange('businessHours', day, { ...hours, start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="time"
                    label="End Time"
                    value={hours.end}
                    onChange={(e) => handleChange('businessHours', day, { ...hours, end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appointment Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Default Duration (minutes)"
              value={settings.appointmentSettings.defaultDuration}
              onChange={(e) => handleChange('appointmentSettings', 'defaultDuration', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Buffer Time (minutes)"
              value={settings.appointmentSettings.bufferTime}
              onChange={(e) => handleChange('appointmentSettings', 'bufferTime', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Max Advance Booking (days)"
              value={settings.appointmentSettings.maxAdvanceBookingDays}
              onChange={(e) => handleChange('appointmentSettings', 'maxAdvanceBookingDays', parseInt(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Reminder Lead Time (hours)"
              value={settings.appointmentSettings.reminderLeadTime}
              onChange={(e) => handleChange('appointmentSettings', 'reminderLeadTime', parseInt(e.target.value))}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.enableEmailReminders}
                  onChange={(e) => handleChange('notifications', 'enableEmailReminders', e.target.checked)}
                />
              }
              label="Enable Email Reminders"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.enableSMSReminders}
                  onChange={(e) => handleChange('notifications', 'enableSMSReminders', e.target.checked)}
                />
              }
              label="Enable SMS Reminders"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reminder Template"
              value={settings.notifications.reminderTemplate}
              onChange={(e) => handleChange('notifications', 'reminderTemplate', e.target.value)}
              helperText="Available variables: {patientName}, {date}, {time}, {dentistName}"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving && <CircularProgress size={20} />}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings; 