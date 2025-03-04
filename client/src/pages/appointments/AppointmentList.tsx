import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  dentist: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reason: string;
  urgency: string;
}

const AppointmentList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [status, setStatus] = useState('scheduled');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        status,
        ...(startDate && { startDate: startDate.toISOString() }),
        ...(endDate && { endDate: endDate.toISOString() }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await api.get(`/appointments?${params}`);
      setAppointments(response.data.appointments);
      setTotal(response.data.pagination.total);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch appointments',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, rowsPerPage, status, startDate, endDate, searchTerm]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.post(`/appointments/${id}/cancel`, {
        reason: 'Cancelled by staff'
      });
      
      dispatch(addNotification({
        message: 'Appointment cancelled successfully',
        type: 'success'
      }));
      
      fetchAppointments();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to cancel appointment',
        type: 'error'
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'confirmed':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Appointments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/appointments/new')}
        >
          New Appointment
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="no-show">No Show</MenuItem>
            </Select>
          </FormControl>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            slotProps={{
              textField: { size: 'small' }
            }}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            slotProps={{
              textField: { size: 'small' }
            }}
          />
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Dentist</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No appointments found</TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    {appointment.patient.firstName} {appointment.patient.lastName}
                    <Typography variant="caption" display="block" color="textSecondary">
                      {appointment.patient.email}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    Dr. {appointment.dentist.firstName} {appointment.dentist.lastName}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(appointment.startTime), 'PPP')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {format(new Date(appointment.startTime), 'p')} - {format(new Date(appointment.endTime), 'p')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getAppointmentTypeLabel(appointment.type)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
                      title="Edit"
                      disabled={['completed', 'cancelled'].includes(appointment.status)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleCancelAppointment(appointment._id)}
                      title="Cancel"
                      disabled={['completed', 'cancelled'].includes(appointment.status)}
                    >
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};

export default AppointmentList; 