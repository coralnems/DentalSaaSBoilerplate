import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormHelperText,
  IconButton,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { addMinutes, format, isBefore } from 'date-fns';
import { addNotification, showNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { RootState } from '../../store';

interface AppointmentFormProps {
  initialValues?: any;
  isEditing?: boolean;
  open?: boolean;
  onClose?: () => void;
  appointment?: any;
  onSave?: () => void;
  userRole?: string;
  userId?: string;
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
  phone: string;
}

interface Dentist {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Treatment {
  _id: string;
  name: string;
  description: string;
  price: number;
}

interface Appointment {
  _id?: string;
  patientId: string;
  dentistId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  type: string;
  notes?: string;
  treatmentId?: string;
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

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialValues = defaultInitialValues, isEditing = false, open, onClose, appointment, onSave, userRole, userId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<string>('');
  const [formData, setFormData] = useState(initialValues);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  useEffect(() => {
    fetchPatients();
    fetchDentists();
    fetchTreatments();
  }, []);

  useEffect(() => {
    if (selectedDentist && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDentist, selectedDate]);

  useEffect(() => {
    if (open) {
      fetchData();
      
      if (appointment) {
        setFormData(appointment);
        
        const patient = patients.find(p => p._id === appointment.patient);
        setSelectedPatient(patient || null);
        
        if (appointment.treatmentId) {
          const treatment = dentists.find(d => d._id === appointment.treatmentId);
          setSelectedTreatment(treatment || null);
        }
      } else {
        setFormData(initialValues);
        setSelectedPatient(null);
        setSelectedTreatment(null);
      }
    }
  }, [open, appointment, initialValues, patients, dentists]);

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

  const fetchData = async () => {
    setLoading(true);
    try {
      // In production, these would be real API calls
      // const patientsResponse = await axios.get('/api/patients');
      // const treatmentsResponse = await axios.get('/api/treatments');
      
      // For now, we'll use mock data
      // setPatients(mockPatients);
      // setTreatments(mockTreatments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientChange = (event: any, newValue: any) => {
    setSelectedPatient(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        patient: newValue._id,
        patientName: `${newValue.firstName} ${newValue.lastName}`,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient: '',
        patientName: '',
      }));
    }
  };

  const handleTreatmentChange = (event: any, newValue: any) => {
    setSelectedTreatment(newValue);
    if (newValue) {
      const endTime = new Date(formData.startTime.getTime() + newValue.duration * 60000);
      
      setFormData(prev => ({
        ...prev,
        treatmentId: newValue._id,
        treatmentName: newValue.name,
        endTime,
      }));
    } else {
      const endTime = new Date(formData.startTime.getTime() + 30 * 60000);
      
      setFormData(prev => ({
        ...prev,
        treatmentId: '',
        treatmentName: '',
        endTime,
      }));
    }
  };

  const handleStartTimeChange = (date: Date | null) => {
    if (!date) return;
    
    const currentDuration = formData.endTime.getTime() - formData.startTime.getTime();
    
    const newEndTime = new Date(date.getTime() + currentDuration);
    
    setFormData(prev => ({
      ...prev,
      startTime: date,
      endTime: newEndTime,
    }));
  };

  const handleEndTimeChange = (date: Date | null) => {
    if (!date) return;
    setFormData(prev => ({
      ...prev,
      endTime: date,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patient) {
      newErrors.patient = 'Patient is required';
    }
    
    if (!formData.type) {
      newErrors.type = 'Appointment type is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    if (formData.endTime <= formData.startTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // In a real application, this would call the API
      // const response = appointment && appointment._id
      //   ? await axios.put(`/api/appointments/${appointment._id}`, formData)
      //   : await axios.post('/api/appointments', formData);
      
      // For demonstration, simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the onSave callback with the form data
      onSave && onSave();
      onClose && onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {isEditing ? 'Edit Appointment' : 'New Appointment'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={selectedPatient}
                onChange={handlePatientChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Patient"
                    required
                    error={!!errors.patient}
                    helperText={errors.patient}
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={dentists}
                getOptionLabel={(option) => `Dr. ${option.firstName} ${option.lastName}`}
                value={selectedTreatment}
                onChange={handleTreatmentChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Treatment"
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel id="type-label">Appointment Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Appointment Type"
                >
                  <MenuItem value="checkup">Check-up</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="filling">Filling</MenuItem>
                  <MenuItem value="extraction">Extraction</MenuItem>
                  <MenuItem value="root-canal">Root Canal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.status}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="no_show">No Show</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={handleEndTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime,
                    },
                  }}
                  minDateTime={new Date(formData.startTime.getTime() + 5 * 60000)}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Enter any additional notes about this appointment"
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Appointment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentForm; 