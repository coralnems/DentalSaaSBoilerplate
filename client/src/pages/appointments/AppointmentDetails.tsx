import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  dentistId: string;
  dentistName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'no-show':
      return 'warning';
    default:
      return 'default';
  }
};

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to fetch appointment details
    setLoading(false);
  }, [id]);

  const handleEdit = () => {
    navigate(`/appointments/${id}/edit`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Appointment not found</Typography>
      </Container>
    );
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <div>
            <Typography variant="h4" gutterBottom>
              Appointment Details
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              ID: {appointment._id}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Appointment
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Date & Time
            </Typography>
            <Typography>
              {formatDateTime(appointment.date, appointment.time)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Status
            </Typography>
            <Chip
              label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              color={getStatusColor(appointment.status) as any}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Patient
            </Typography>
            <Typography>{appointment.patientName}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Dentist
            </Typography>
            <Typography>{appointment.dentistName}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Reason for Visit
            </Typography>
            <Typography>{appointment.reason}</Typography>
          </Grid>

          {appointment.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Typography>{appointment.notes}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(appointment.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last Updated: {new Date(appointment.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default AppointmentDetails; 