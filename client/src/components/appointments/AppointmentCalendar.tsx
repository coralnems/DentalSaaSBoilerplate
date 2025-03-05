import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  useTheme,
  alpha,
  Button,
  Snackbar,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  PersonOutlined, 
  CalendarTodayOutlined,
  AccessTimeOutlined,
  LocalHospitalOutlined, 
  CheckCircleOutlined, 
  CancelOutlined,
  PendingOutlined,
  AddCircleOutline as AddIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { api } from '../../services/api';
import AppointmentForm from './AppointmentForm';
import { useDispatch, useSelector } from 'react-redux';
import { showNotification } from '../../store/slices/uiSlice';
import type { RootState } from '../../store';
import axiosInstance from '../../utils/axiosInstance';

// Set up the localizer
const localizer = momentLocalizer(moment);

// Create DnD Calendar
const DnDCalendar = withDragAndDrop(Calendar);

// Define the Event type that matches what react-big-calendar expects
type CalendarEvent = Appointment;

// Define appointment status colors with brighter colors
const STATUS_COLORS = {
  confirmed: '#4caf50', // green
  pending: '#ff9800',   // orange
  cancelled: '#f44336', // red
  completed: '#2196f3', // blue
  noShow: '#9e9e9e',    // grey
};

// Define doctor colors for the legend with brighter colors
const DOCTOR_COLORS = {
  'Dr. Smith': '#8e24aa',
  'Dr. Johnson': '#3f51b5',
  'Dr. Williams': '#00acc1',
  'Dr. Brown': '#e91e63',
  'Dr. Davis': '#ff9800',
};

// Custom calendar styles for better readability
const calendarStyleOverrides = {
  '.rbc-calendar': {
    background: '#ffffff',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    width: '100%',
    maxWidth: '100%',
  },
  '.rbc-header': {
    padding: '8px 4px',
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    color: '#333',
    borderBottom: '1px solid #ddd',
  },
  '.rbc-month-view': {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  '.rbc-day-bg': {
    backgroundColor: '#ffffff',
  },
  '.rbc-today': {
    backgroundColor: '#f0f7ff !important',
  },
  '.rbc-off-range-bg': {
    backgroundColor: '#f9f9f9',
  },
  '.rbc-event': {
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    padding: '4px',
    fontSize: '0.85rem',
    fontWeight: '500',
    border: 'none',
  },
  '.rbc-event-label': {
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  '.rbc-time-view': {
    border: '1px solid #eee',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  '.rbc-time-header': {
    backgroundColor: '#f5f5f5',
  },
  '.rbc-timeslot-group': {
    borderBottom: '1px solid #f0f0f0',
  },
  '.rbc-time-slot': {
    color: '#666',
  },
  '.rbc-current-time-indicator': {
    backgroundColor: '#f44336',
    height: '2px',
  },
};

// Type definitions
interface Appointment {
  _id: string;
  title: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  start: Date;
  end: Date;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'noShow';
  notes?: string;
  treatment?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AppointmentCalendarProps {
  userRole?: string;
  userId?: string;
  onAppointmentSelected?: (appointment: Appointment) => void;
  onAppointmentCreated?: () => void;
  onAppointmentUpdated?: () => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  userRole = 'admin',
  userId,
  onAppointmentSelected,
  onAppointmentCreated,
  onAppointmentUpdated,
}) => {
  const theme = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [lastSavedAppointment, setLastSavedAppointment] = useState<Appointment | null>(null);

  // Function to fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let endpoint = '/api/appointments';
      
      // Filter by role if needed
      if (userRole === 'doctor' && userId) {
        endpoint = `/api/appointments?doctorId=${userId}`;
      } else if (userRole === 'patient' && userId) {
        endpoint = `/api/appointments?patientId=${userId}`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data && response.data.data) {
        // Convert string dates to Date objects
        const formattedAppointments = response.data.data.map((apt: any) => ({
          ...apt,
          start: new Date(apt.start),
          end: new Date(apt.end),
        }));
        
        setAppointments(formattedAppointments);
      } else {
        // Use mock data if no appointments are returned
        const mockAppointments = generateMockAppointments();
        setAppointments(mockAppointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Using mock data instead.');
      
      // Use mock data as fallback
      const mockAppointments = generateMockAppointments();
      setAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  // Generate mock appointment data for development
  const generateMockAppointments = () => {
    const mockAppointments: Appointment[] = [];
    const today = new Date();
    const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'];
    const treatments = ['Cleaning', 'Filling', 'Crown', 'Root Canal', 'Extraction', 'Consultation'];
    const patients = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Wilson'];
    const statuses: ('confirmed' | 'pending' | 'cancelled' | 'completed' | 'noShow')[] = 
      ['confirmed', 'pending', 'cancelled', 'completed', 'noShow'];
    
    // Create appointments for the current week
    for (let i = 0; i < 20; i++) {
      const dayOffset = Math.floor(Math.random() * 10) - 5; // -5 to +5 days from today
      const hourOffset = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      
      const start = new Date(today);
      start.setDate(today.getDate() + dayOffset);
      start.setHours(hourOffset, 0, 0, 0);
      
      const end = new Date(start);
      end.setMinutes(start.getMinutes() + 30 + Math.floor(Math.random() * 5) * 15); // 30-90 min appointments
      
      const doctorName = doctors[Math.floor(Math.random() * doctors.length)];
      const patientName = patients[Math.floor(Math.random() * patients.length)];
      const treatment = treatments[Math.floor(Math.random() * treatments.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      mockAppointments.push({
        _id: `mock-apt-${i}`,
        title: `${treatment} - ${patientName}`,
        patientId: `patient-${i % 5}`,
        patientName,
        doctorId: `doctor-${i % 5}`,
        doctorName,
        start,
        end,
        status,
        treatment,
        notes: `Mock appointment for ${treatment}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return mockAppointments;
  };

  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Handle event selection with proper typing
  const handleSelectEvent = useCallback(
    (event: any) => {
      if (onAppointmentSelected) {
        onAppointmentSelected(event as Appointment);
      }
    },
    [onAppointmentSelected]
  );

  // Handle slot selection for new appointment
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (userRole === 'admin' || userRole === 'receptionist' || userRole === 'doctor') {
        // Check if clinic is open during these hours (e.g., 9 AM - 5 PM)
        const startHour = start.getHours();
        const endHour = end.getHours();
        const isWeekend = start.getDay() === 0 || start.getDay() === 6;
        
        if (isWeekend) {
          setError('Cannot create appointments on weekends');
          return;
        }
        
        if (startHour < 9 || endHour > 17) {
          setError('Appointments can only be created between 9 AM and 5 PM');
          return;
        }
        
        // For a real app, you would open a form/modal here
        console.log('Create appointment:', { start, end });
        
        // Placeholder for appointment creation - in a real app this would be an API call
        const newAppointment: Appointment = {
          _id: `new-${Date.now()}`,
          title: 'New Appointment',
          patientId: 'placeholder',
          patientName: 'New Patient',
          doctorId: 'placeholder',
          doctorName: 'Dr. Smith',
          start,
          end,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Update local state with the new appointment
        setAppointments(prev => [...prev, newAppointment]);
        setLastSavedAppointment(newAppointment);
        
        // Notify parent component
        if (onAppointmentCreated) {
          onAppointmentCreated();
        }
      }
    },
    [userRole, onAppointmentCreated]
  );

  // Handle drag and drop with proper typing
  const handleEventDrop = useCallback(
    async ({ event, start, end }: any) => {
      if (userRole !== 'admin' && userRole !== 'receptionist' && userRole !== 'doctor') {
        setError('You do not have permission to move appointments');
        return;
      }
      
      try {
        setError(null);
        
        // Create updated appointment object
        const updatedAppointment = {
          ...(event as Appointment),
          start,
          end
        };
        
        // In a real app, this would be an API call
        // await api.put(`/api/appointments/${event._id}`, updatedAppointment);
        
        // Update the local state
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === (event as Appointment)._id
              ? { ...apt, start, end }
              : apt
          )
        );
        
        // Store the last saved state
        setLastSavedAppointment(updatedAppointment);
        
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
      } catch (err) {
        console.error('Error updating appointment:', err);
        setError('Failed to update appointment. Please try again.');
      }
    },
    [userRole, onAppointmentUpdated]
  );

  // Handle resize with proper typing
  const handleEventResize = useCallback(
    async ({ event, start, end }: any) => {
      if (userRole !== 'admin' && userRole !== 'receptionist' && userRole !== 'doctor') {
        setError('You do not have permission to resize appointments');
        return;
      }
      
      try {
        setError(null);
        
        // Create updated appointment object
        const updatedAppointment = {
          ...(event as Appointment),
          start,
          end
        };
        
        // In a real app, this would be an API call
        // await api.put(`/api/appointments/${event._id}`, updatedAppointment);
        
        // Update the local state
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === (event as Appointment)._id
              ? { ...apt, start, end }
              : apt
          )
        );
        
        // Store the last saved state
        setLastSavedAppointment(updatedAppointment);
        
        if (onAppointmentUpdated) {
          onAppointmentUpdated();
        }
      } catch (err) {
        console.error('Error resizing appointment:', err);
        setError('Failed to update appointment duration. Please try again.');
      }
    },
    [userRole, onAppointmentUpdated]
  );

  // Custom event styling with proper typing
  const eventPropGetter = useCallback(
    (event: any) => {
      const appointment = event as Appointment;
      const isSelected = lastSavedAppointment && lastSavedAppointment._id === appointment._id;
      const statusColor = STATUS_COLORS[appointment.status] || '#3174ad';
      const doctorColor = appointment.doctorName ? DOCTOR_COLORS[appointment.doctorName as keyof typeof DOCTOR_COLORS] : undefined;
      const backgroundColor = doctorColor || statusColor;
      
      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: isSelected ? 1 : 0.8,
          color: '#fff',
          border: isSelected ? '2px solid #333' : '0px',
          display: 'block',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          fontSize: '0.9rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        },
      };
    },
    [lastSavedAppointment]
  );

  // Custom event component with proper typing
  const EventComponent = ({ event }: { event: any }) => {
    const appointment = event as Appointment;
    return (
      <div style={{ height: '100%', padding: '3px' }}>
        <strong>{appointment.title}</strong>
        <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
          <PersonOutlined fontSize="inherit" /> {appointment.patientName}
        </div>
        <div style={{ fontSize: '0.8rem' }}>
          <LocalHospitalOutlined fontSize="inherit" /> {appointment.doctorName}
        </div>
      </div>
    );
  };

  // Custom components
  const components = {
    event: EventComponent,
  };

  // Render status/doctor legend
  const renderLegend = () => (
    <Paper elevation={1} sx={{ p: 2, mt: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Appointment Status
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <Chip
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  '& .MuiChip-label': { px: 1 },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Dentists
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {Object.entries(DOCTOR_COLORS).map(([doctor, color]) => (
              <Chip
                key={doctor}
                label={doctor}
                size="small"
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  '& .MuiChip-label': { px: 1 },
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ 
      height: 'calc(100vh - 200px)', 
      display: 'flex', 
      flexDirection: 'column',
      width: '100%',
      maxWidth: '100%'
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {renderLegend()}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ flexGrow: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <Paper elevation={2} sx={{ 
            p: 1, 
            flexGrow: 1,
            width: '100%',
            maxWidth: '100%',
            overflowX: 'hidden'
          }}>
            {/* Apply custom styles to the calendar */}
            <style>
              {Object.entries(calendarStyleOverrides)
                .map(([selector, styles]) => {
                  const cssRules = Object.entries(styles as Record<string, string>)
                    .map(([property, value]) => `${property}: ${value};`)
                    .join('\n');
                  return `${selector} {\n${cssRules}\n}`;
                })
                .join('\n')}
            </style>
            
            <DnDCalendar
              localizer={localizer}
              events={appointments}
              startAccessor={(event) => new Date((event as any).start)}
              endAccessor={(event) => new Date((event as any).end)}
              style={{ height: '100%', width: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              step={15}
              defaultView={Views.WEEK}
              defaultDate={new Date()}
              selectable={userRole !== 'patient'}
              resizable={userRole === 'admin' || userRole === 'receptionist' || userRole === 'doctor'}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              eventPropGetter={eventPropGetter}
              components={components}
              view={view}
              date={date}
              onView={(newView) => setView(newView as any)}
              onNavigate={(newDate) => setDate(newDate)}
              formats={{
                timeGutterFormat: (date, culture, localizer?) =>
                  localizer ? localizer.format(date, 'h:mm A', culture || 'en') : '',
                eventTimeRangeFormat: ({ start, end }, culture, localizer?) =>
                  localizer ? 
                  `${localizer.format(start, 'h:mm A', culture || 'en')} - ${localizer.format(end, 'h:mm A', culture || 'en')}`
                  : '',
              }}
              popup
              showMultiDayTimes
            />
          </Paper>
        </DndProvider>
      )}
    </Box>
  );
};

export default AppointmentCalendar; 