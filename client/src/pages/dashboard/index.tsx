import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { getUserRole } from '../../services/auth';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import PatientDashboard from './PatientDashboard';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from the token
    const role = getUserRole();
    setUserRole(role);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render specific dashboard based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    case 'patient':
      return <PatientDashboard />;
    default:
      // Generic dashboard as fallback
      return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Welcome Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to Your Dental Clinic Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your patients, appointments, and clinic operations from here.
                </Typography>
              </Paper>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography variant="h6" gutterBottom>
                  Today's Appointments
                </Typography>
                <Typography component="p" variant="h4">
                  0
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography variant="h6" gutterBottom>
                  Total Patients
                </Typography>
                <Typography component="p" variant="h4">
                  0
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Actions
                </Typography>
                <Typography component="p" variant="h4">
                  0
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      );
  }
};

export default Dashboard; 