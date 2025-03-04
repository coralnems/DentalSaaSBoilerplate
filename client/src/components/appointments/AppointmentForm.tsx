import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Autocomplete,
  useTheme
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { addMinutes, format } from 'date-fns';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface AppointmentFormProps {
  initialValues?: any;
  isEditing?: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Dentist {
  _id: string;
  firstName: string;
  lastName: string;
}

const validationSchema = Yup.object({
  patient: Yup.string().required('Patient is required'),
  dentist: Yup.string().required('Dentist is required'),
  startTime: Yup.date().required('Start time is required'),
  endTime: Yup.date().required('End time is required'),
  type: Yup.string().required('Appointment type is required'),
  reason: Yup.string().required('Reason is required'),
  urgency: Yup.string(),
  notes: Yup.string(),
  reminders: Yup.array().of(Yup.string())
});

const defaultInitialValues = {
  patient: '',
  dentist: '',
  startTime: null,
  endTime: null,
  type: '',
  reason: '',
  urgency: 'low',
  notes: '',
  reminders: ['email']
};

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialValues = defaultInitialValues, isEditing = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<string>('');

  useEffect(() => {
    fetchPatients();
    fetchDentists();
  }, []);

  useEffect(() => {
    if (selectedDentist && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDentist, selectedDate]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.patients);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch patients',
        type: 'error'
      }));
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await api.get('/users?role=dentist');
      setDentists(response.data.users);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch dentists',
        type: 'error'
      }));
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/appointments/available-slots', {
        params: {
          dentistId: selectedDentist,
          date: selectedDate?.toISOString(),
          duration: 30 // Default duration in minutes
        }
      });
      setAvailableSlots(response.data);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch available slots',
        type: 'error'
      }));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/appointments/${initialValues._id}`, values);
        dispatch(addNotification({
          message: 'Appointment updated successfully',
          type: 'success'
        }));
      } else {
        await api.post('/appointments', values);
        dispatch(addNotification({
          message: 'Appointment created successfully',
          type: 'success'
        }));
      }
      navigate('/appointments');
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to save appointment',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <Box p={3}>
            <Typography variant="h5" gutterBottom>
              {isEditing ? 'Edit Appointment' : 'New Appointment'}
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(patient) => `${patient.firstName} ${patient.lastName}`}
                    value={patients.find(p => p._id === values.patient) || null}
                    onChange={(_, newValue) => {
                      setFieldValue('patient', newValue?._id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Patient"
                        error={touched.patient && Boolean(errors.patient)}
                        helperText={touched.patient && (errors.patient as string)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Autocomplete
                    options={dentists}
                    getOptionLabel={(dentist) => `Dr. ${dentist.firstName} ${dentist.lastName}`}
                    value={dentists.find(d => d._id === values.dentist) || null}
                    onChange={(_, newValue) => {
                      setFieldValue('dentist', newValue?._id || '');
                      setSelectedDentist(newValue?._id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Dentist"
                        error={touched.dentist && Boolean(errors.dentist)}
                        helperText={touched.dentist && (errors.dentist as string)}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Date"
                    value={selectedDate}
                    onChange={(date) => {
                      setSelectedDate(date);
                      setFieldValue('startTime', null);
                      setFieldValue('endTime', null);
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Slot</InputLabel>
                    <Select
                      value=""
                      label="Time Slot"
                      onChange={(event) => {
                        const slot = availableSlots[parseInt(event.target.value)];
                        setFieldValue('startTime', new Date(slot.startTime));
                        setFieldValue('endTime', new Date(slot.endTime));
                      }}
                      disabled={!selectedDate || !selectedDentist}
                    >
                      {availableSlots.map((slot, index) => (
                        <MenuItem key={index} value={index}>
                          {format(new Date(slot.startTime), 'p')} - {format(new Date(slot.endTime), 'p')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={values.type}
                      label="Type"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.type && Boolean(errors.type)}
                    >
                      <MenuItem value="checkup">Check-up</MenuItem>
                      <MenuItem value="cleaning">Cleaning</MenuItem>
                      <MenuItem value="filling">Filling</MenuItem>
                      <MenuItem value="extraction">Extraction</MenuItem>
                      <MenuItem value="root-canal">Root Canal</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Urgency</InputLabel>
                    <Select
                      name="urgency"
                      value={values.urgency}
                      label="Urgency"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="reason"
                    label="Reason"
                    value={values.reason}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.reason && Boolean(errors.reason)}
                    helperText={touched.reason && (errors.reason as string)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="notes"
                    label="Notes"
                    value={values.notes}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/appointments')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {isEditing ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default AppointmentForm; 