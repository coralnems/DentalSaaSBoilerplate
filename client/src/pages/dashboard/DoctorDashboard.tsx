import React from 'react';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, Divider, Box, Avatar, Chip } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AssignmentIcon from '@mui/icons-material/Assignment';

const DoctorDashboard: React.FC = () => {
  // Mock data for today's appointments
  const todayAppointments = [
    { 
      id: 1, 
      time: '09:00 AM', 
      patientName: 'John Doe', 
      reason: 'Dental Cleaning', 
      status: 'Confirmed'
    },
    { 
      id: 2, 
      time: '10:30 AM', 
      patientName: 'Sarah Johnson', 
      reason: 'Root Canal', 
      status: 'In Progress'
    },
    { 
      id: 3, 
      time: '01:15 PM', 
      patientName: 'Michael Brown', 
      reason: 'Tooth Extraction', 
      status: 'Waiting'
    },
    { 
      id: 4, 
      time: '03:45 PM', 
      patientName: 'Amanda Wilson', 
      reason: 'Consultation', 
      status: 'Confirmed'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#2e7d32', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Doctor Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome back, Dr. Smith. Manage your appointments, patient records, and treatments.
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
              <PersonIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Your Patients
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              124
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Treatments
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              48
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AssignmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Pending Reports
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              3
            </Typography>
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Today's Appointment Schedule
            </Typography>
            <Divider />
            <List>
              {todayAppointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: '0.875rem', mr: 2 }}>
                        {appointment.patientName.split(' ').map((n) => n[0]).join('')}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{appointment.time}</Typography>
                        <Typography variant="body2" color="text.secondary">{appointment.patientName}</Typography>
                      </Box>
                    </Box>
                    <ListItemText 
                      primary={appointment.reason}
                      sx={{ ml: 2 }}
                    />
                    <Chip 
                      label={appointment.status} 
                      color={
                        appointment.status === 'Confirmed' ? 'success' : 
                        appointment.status === 'In Progress' ? 'primary' : 
                        'warning'
                      }
                      size="small"
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Patient Notes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Recent Patient Notes
            </Typography>
            <Divider />
            <List>
              <ListItem>
                <ListItemText 
                  primary="Sarah Johnson" 
                  secondary="Root canal treatment first phase completed. Patient scheduled for follow-up in 2 weeks." 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">Today</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Robert Williams" 
                  secondary="Full dental examination completed. Two cavities identified on upper molars. Treatment plan created." 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">Yesterday</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Emily Davis" 
                  secondary="Wisdom tooth extraction completed. Recovery progressing well. Pain management prescribed." 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">2 days ago</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Quick Tools */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Doctor Tools
            </Typography>
            <Divider />
            <List>
              <ListItem button>
                <ListItemText primary="Patient Records" secondary="Access and update patient medical records" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="Treatment Plans" secondary="Create and manage patient treatment plans" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="Prescriptions" secondary="Write and manage patient prescriptions" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="Lab Results" secondary="View patient lab and imaging results" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDashboard; 