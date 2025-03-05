import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  useTheme, 
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Chip
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import axios from 'axios';
import AppointmentForm from './AppointmentForm';

// Setup the localizer for the calendar
const localizer = momentLocalizer(moment);

// Appointment interface
interface Appointment {
  _id: string;
  title?: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  startTime: Date;
  endTime: Date;
  status: string;
  type: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for calendar display event
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

// Function to convert an appointment to a calendar event
const appointmentToEvent = (appointment: Appointment): CalendarEvent => {
  return {
    id: appointment._id,
    title: `${appointment.patientName} - ${appointment.type.replace('_', ' ').charAt(0).toUpperCase() + appointment.type.replace('_', ' ').slice(1)}`,
    start: new Date(appointment.startTime),
    end: new Date(appointment.endTime),
    resource: appointment,
  };
};

// Status colors for appointments
const statusColors: Record<string, string> = {
  scheduled: '#4caf50', // Green
  confirmed: '#2196f3', // Blue
  cancelled: '#f44336', // Red
  completed: '#9c27b0', // Purple
  no_show: '#ff9800',   // Orange
};

const AppointmentCalendarUpdated: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  
  // State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Configure the API with auth token
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  
  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // API request to get appointments
      const response = await api.get('/appointments');
      
      // Convert appointments to calendar events
      const appointmentEvents = response.data.map(appointmentToEvent);
      
      setEvents(appointmentEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setErrorMessage('Failed to load appointments. Please try again.');
      setLoading(false);
    }
  }, []);
  
  // Load appointments on component mount and when refreshKey changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, refreshKey]);
  
  // Handle form open/close
  const handleOpenForm = (appointment: Appointment | null = null) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedAppointment(null);
  };
  
  // Handle appointment save
  const handleSaveAppointment = async (appointment: Appointment) => {
    try {
      // Determine if it's an update or create
      if (appointment._id) {
        // Update existing appointment
        await api.put(`/appointments/${appointment._id}`, appointment);
        setSuccessMessage('Appointment updated successfully');
      } else {
        // Create new appointment
        await api.post('/appointments', appointment);
        setSuccessMessage('Appointment created successfully');
      }
      
      // Refresh the appointments list
      setRefreshKey(prev => prev + 1);
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setErrorMessage('Failed to save appointment. Please try again.');
    }
  };
  
  // Handle appointment deletion
  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      // Delete appointment
      await api.delete(`/appointments/${appointmentId}`);
      
      // Refresh the appointments list
      setRefreshKey(prev => prev + 1);
      setSuccessMessage('Appointment deleted successfully');
      
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setErrorMessage('Failed to delete appointment. Please try again.');
    }
  };
  
  // Custom event component for the calendar
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const appointment = event.resource;
    
    return (
      <Box
        sx={{
          backgroundColor: statusColors[appointment.status] || theme.palette.primary.main,
          color: '#fff',
          p: 0.5,
          borderRadius: '4px',
          fontSize: '0.8rem',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          cursor: 'pointer',
          height: '100%',
          '&:hover': {
            opacity: 0.9,
          },
        }}
        onClick={() => handleOpenForm(appointment)}
      >
        <Typography variant="subtitle2" noWrap>
          {event.title}
        </Typography>
        <Typography variant="caption" noWrap>
          {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
        </Typography>
      </Box>
    );
  };
  
  // Clear error message
  const handleErrorClose = () => {
    setErrorMessage(null);
  };
  
  // Clear success message
  const handleSuccessClose = () => {
    setSuccessMessage(null);
  };
  
  // Handle slot selection (when user clicks on an empty time slot)
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Create a new appointment object with default values
    const newAppointment: Appointment = {
      _id: '',
      patientId: '',
      patientName: '',
      dentistId: '',
      dentistName: '',
      startTime: start,
      endTime: end,
      status: 'scheduled',
      type: 'check_up',
      notes: '',
    };
    
    handleOpenForm(newAppointment);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h5">Appointment Calendar</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          New Appointment
        </Button>
      </Box>
      
      {/* Error Message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={handleErrorClose}
          action={
            <IconButton 
              size="small" 
              aria-label="close" 
              color="inherit" 
              onClick={handleErrorClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleSuccessClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={handleSuccessClose}
          action={
            <IconButton 
              size="small" 
              aria-label="close" 
              color="inherit" 
              onClick={handleSuccessClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ mr: 1 }}>Status:</Typography>
        {Object.entries(statusColors).map(([status, color]) => (
          <Chip
            key={status}
            label={status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            size="small"
            sx={{ 
              backgroundColor: color,
              color: '#fff',
              mb: 1
            }}
          />
        ))}
      </Box>
      
      {/* Calendar */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          flexGrow: 1, 
          height: 'calc(100vh - 220px)', 
          position: 'relative',
          borderRadius: 2
        }}
      >
        {loading ? (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}
          >
            <CircularProgress />
          </Box>
        ) : null}
        
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          components={{
            event: EventComponent,
          }}
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(event: CalendarEvent) => handleOpenForm(event.resource)}
          defaultView="week"
          views={['month', 'week', 'day']}
          step={15}
          timeslots={4}
          titleAccessor="title"
          dayLayoutAlgorithm="no-overlap"
        />
      </Paper>
      
      {/* Appointment Form Dialog */}
      <AppointmentForm
        open={openForm}
        onClose={handleCloseForm}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
      />
    </Box>
  );
};

export default AppointmentCalendarUpdated; 