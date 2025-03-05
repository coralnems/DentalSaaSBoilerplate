import React from 'react';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, Divider, Box, Button, Chip, Avatar } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import PaymentIcon from '@mui/icons-material/Payment';

const ReceptionistDashboard: React.FC = () => {
  // Mock data for today's appointments
  const todayAppointments = [
    { 
      id: 1, 
      time: '09:00 AM', 
      patientName: 'John Doe', 
      doctor: 'Dr. Smith', 
      status: 'Checked In',
      procedure: 'Dental Cleaning'
    },
    { 
      id: 2, 
      time: '10:30 AM', 
      patientName: 'Sarah Johnson', 
      doctor: 'Dr. Wilson',
      status: 'Waiting',
      procedure: 'Root Canal'
    },
    { 
      id: 3, 
      time: '11:45 AM', 
      patientName: 'Michael Brown', 
      doctor: 'Dr. Smith',
      status: 'Upcoming',
      procedure: 'Tooth Extraction'
    },
    { 
      id: 4, 
      time: '02:15 PM', 
      patientName: 'Amanda Wilson', 
      doctor: 'Dr. Lee',
      status: 'Upcoming',
      procedure: 'Consultation'
    }
  ];

  // Mock data for recent calls
  const recentCalls = [
    {
      id: 1,
      caller: 'David Thompson',
      time: '45 minutes ago',
      purpose: 'Appointment scheduling',
      action: 'Scheduled for May 15, 10:00 AM'
    },
    {
      id: 2,
      caller: 'Linda Garcia',
      time: '1 hour ago',
      purpose: 'Cancellation',
      action: 'Rescheduled to next week'
    },
    {
      id: 3,
      caller: 'Robert Martinez',
      time: '2 hours ago',
      purpose: 'Insurance inquiry',
      action: 'Verification completed'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#0277bd', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Reception Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome back! Manage appointments, patient check-ins, and front desk operations.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Today's Appointments
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              {todayAppointments.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonAddIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                New Patients
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              2
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneInTalkIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Phone Calls
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PaymentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Payments Collected
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              $1,250
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today
            </Typography>
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Today's Appointment Schedule
              </Typography>
              <Button variant="contained" size="small">
                New Appointment
              </Button>
            </Box>
            <Divider />
            <List>
              {todayAppointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ width: '20%', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
                          {appointment.time}
                        </Typography>
                        <Chip 
                          label={appointment.status} 
                          color={
                            appointment.status === 'Checked In' ? 'success' : 
                            appointment.status === 'Waiting' ? 'primary' : 
                            'default'
                          }
                          size="small"
                        />
                      </Box>
                      <Box sx={{ width: '25%', display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', mr: 1 }}>
                          {appointment.patientName.split(' ').map((n) => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {appointment.patientName}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '25%' }}>
                        <Typography variant="body2">
                          {appointment.doctor}
                        </Typography>
                      </Box>
                      <Box sx={{ width: '30%' }}>
                        <Typography variant="body2">
                          {appointment.procedure}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Phone Calls */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Recent Phone Calls
            </Typography>
            <Divider />
            <List>
              {recentCalls.map((call) => (
                <React.Fragment key={call.id}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">{call.caller}</Typography>
                          <Typography variant="caption" color="text.secondary">{call.time}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {call.purpose}
                          </Typography>
                          <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                            {call.action}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Quick Actions
            </Typography>
            <Divider />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', p: 2, gap: 2 }}>
              <Button variant="contained" startIcon={<PersonAddIcon />}>
                Register New Patient
              </Button>
              <Button variant="contained" startIcon={<EventNoteIcon />}>
                Schedule Appointment
              </Button>
              <Button variant="contained" startIcon={<PaymentIcon />}>
                Process Payment
              </Button>
              <Button variant="contained" startIcon={<PhoneInTalkIcon />}>
                Log Phone Call
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReceptionistDashboard; 