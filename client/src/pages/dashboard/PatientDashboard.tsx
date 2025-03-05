import React from 'react';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, Divider, Box, Button, Chip } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/History';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const PatientDashboard: React.FC = () => {
  // Mock patient data
  const patientData = {
    name: 'John Doe',
    nextAppointment: {
      date: 'May 15, 2023',
      time: '10:00 AM',
      doctor: 'Dr. Smith',
      purpose: 'Dental Cleaning'
    },
    recentAppointments: [
      {
        id: 1,
        date: 'April 8, 2023',
        doctor: 'Dr. Wilson',
        procedure: 'Root Canal - Phase 1',
        notes: 'First phase completed successfully. Follow-up required in 2 weeks.'
      },
      {
        id: 2,
        date: 'February 22, 2023',
        doctor: 'Dr. Smith',
        procedure: 'Dental Examination',
        notes: 'Regular checkup. Two cavities identified in upper molars.'
      }
    ],
    treatments: [
      {
        id: 1,
        name: 'Root Canal Treatment',
        status: 'In Progress',
        startDate: 'April 8, 2023',
        endDate: 'May 22, 2023'
      },
      {
        id: 2,
        name: 'Cavity Filling',
        status: 'Scheduled',
        startDate: 'May 15, 2023',
        endDate: 'May 15, 2023'
      }
    ],
    prescriptions: [
      {
        id: 1,
        medicine: 'Amoxicillin',
        dosage: '500mg',
        instructions: 'Take 1 capsule 3 times a day after meals for 7 days',
        prescribed: 'April 8, 2023',
        status: 'Active'
      }
    ],
    bills: [
      {
        id: 1,
        date: 'April 8, 2023',
        description: 'Root Canal - Phase 1',
        amount: 450,
        status: 'Paid'
      },
      {
        id: 2,
        date: 'February 22, 2023',
        description: 'Dental Examination',
        amount: 120,
        status: 'Paid'
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#5c6bc0', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Patient Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome, {patientData.name}. Manage your appointments, view treatment plans, and track your dental history.
            </Typography>
          </Paper>
        </Grid>

        {/* Next Appointment */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon color="primary" sx={{ mr: 2, fontSize: 36 }} />
              <Typography variant="h6">
                Your Next Appointment
              </Typography>
            </Box>
            <Box sx={{ pl: 6 }}>
              <Typography variant="h5" gutterBottom>
                {patientData.nextAppointment.date} at {patientData.nextAppointment.time}
              </Typography>
              <Typography variant="body1">
                With: {patientData.nextAppointment.doctor}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Purpose: {patientData.nextAppointment.purpose}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }}>
                  Reschedule
                </Button>
                <Button variant="outlined" color="error">
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<EventNoteIcon />}
                  sx={{ mb: 2, p: 1.5, justifyContent: 'flex-start' }}
                >
                  Book Appointment
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<HistoryIcon />}
                  sx={{ mb: 2, p: 1.5, justifyContent: 'flex-start' }}
                >
                  View History
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<LocalHospitalIcon />}
                  sx={{ mb: 2, p: 1.5, justifyContent: 'flex-start' }}
                >
                  Treatment Plans
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<ReceiptIcon />}
                  sx={{ mb: 2, p: 1.5, justifyContent: 'flex-start' }}
                >
                  View Bills
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Active Treatments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Current Treatments
            </Typography>
            <Divider />
            <List>
              {patientData.treatments.map((treatment) => (
                <React.Fragment key={treatment.id}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">{treatment.name}</Typography>
                          <Chip 
                            label={treatment.status} 
                            color={treatment.status === 'In Progress' ? 'primary' : 'default'} 
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          From {treatment.startDate} to {treatment.endDate}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Prescriptions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Current Prescriptions
            </Typography>
            <Divider />
            <List>
              {patientData.prescriptions.map((prescription) => (
                <React.Fragment key={prescription.id}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">{prescription.medicine} ({prescription.dosage})</Typography>
                          <Typography variant="caption" color="text.secondary">Prescribed: {prescription.prescribed}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {prescription.instructions}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Chip 
                              label={prescription.status} 
                              color="success" 
                              size="small"
                            />
                            <Button size="small">Refill Request</Button>
                          </Box>
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

        {/* Recent Appointments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Recent Appointment History
            </Typography>
            <Divider />
            <List>
              {patientData.recentAppointments.map((appointment) => (
                <React.Fragment key={appointment.id}>
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">{appointment.procedure}</Typography>
                          <Typography variant="body2" color="text.secondary">{appointment.date}</Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            Doctor: {appointment.doctor}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Notes: {appointment.notes}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              <ListItem button>
                <ListItemText primary="View Complete Medical History" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDashboard; 