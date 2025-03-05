import React from 'react';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#1976d2', color: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Administrator Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome to the administrator dashboard. Manage your clinic's operations, staff, and system settings.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleAltIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Staff Members
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              12
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleAltIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Total Patients
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              248
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventNoteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Appointments
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              36
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This week
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 140, bgcolor: '#f5f5f5' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" gutterBottom>
                Revenue
              </Typography>
            </Box>
            <Typography component="p" variant="h4">
              $12,480
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </Paper>
        </Grid>

        {/* Admin Tools */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Administrative Tools
            </Typography>
            <Divider />
            <List>
              <ListItem button>
                <ListItemText primary="User Management" secondary="Add, edit, or delete system users" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="Clinic Settings" secondary="Configure clinic details and settings" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="System Logs" secondary="View system activity and audit logs" />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText primary="Backup & Restore" secondary="Manage system backups" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              Recent Activity
            </Typography>
            <Divider />
            <List>
              <ListItem>
                <ListItemText 
                  primary="New User Created" 
                  secondary="Dr. James Wilson was added to the system" 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">2 hours ago</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="System Update" 
                  secondary="Dental Clinic Management System was updated to version 2.4.1" 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">Yesterday</Typography>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Backup Completed" 
                  secondary="System backup completed successfully" 
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">2 days ago</Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 