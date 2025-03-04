import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';
import { RootState } from '../../store';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  specialization?: string;
  qualifications?: string[];
  avatar?: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    pushNotifications: boolean;
  };
  theme: 'light' | 'dark';
  language: string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      if (response.data.avatar) {
        setAvatarPreview(response.data.avatar);
      }
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch profile',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      // If there's a new avatar, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.post('/users/profile/avatar', formData);
      }

      // Update profile information
      await api.put('/users/profile', profile);

      dispatch(addNotification({
        message: 'Profile updated successfully',
        type: 'success'
      }));
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    if (profile) {
      setProfile(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  if (loading || !profile) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Profile Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar
            src={avatarPreview || profile.avatar}
            sx={{ width: 120, height: 120, mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleAvatarChange}
          />
          <label htmlFor="avatar-upload">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="span"
            >
              <PhotoCamera />
            </IconButton>
          </label>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={profile.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={profile.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={profile.email}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {profile.role === 'dentist' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Professional Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialization"
                value={profile.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Qualifications"
                value={profile.qualifications?.join(', ')}
                onChange={(e) => handleChange('qualifications', e.target.value.split(', '))}
                helperText="Separate qualifications with commas"
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notification Preferences
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.notificationPreferences.email}
                  onChange={(e) => handleChange('notificationPreferences', {
                    ...profile.notificationPreferences,
                    email: e.target.checked
                  })}
                />
              }
              label="Email Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.notificationPreferences.sms}
                  onChange={(e) => handleChange('notificationPreferences', {
                    ...profile.notificationPreferences,
                    sms: e.target.checked
                  })}
                />
              }
              label="SMS Notifications"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={profile.notificationPreferences.pushNotifications}
                  onChange={(e) => handleChange('notificationPreferences', {
                    ...profile.notificationPreferences,
                    pushNotifications: e.target.checked
                  })}
                />
              }
              label="Push Notifications"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Theme"
              value={profile.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Language"
              value={profile.language}
              onChange={(e) => handleChange('language', e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </TextField>
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
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Profile; 