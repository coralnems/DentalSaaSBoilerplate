import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, Button, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import AppointmentForm from '../../components/appointments/AppointmentForm';
import { useAuth } from '../../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%', pt: 2 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `appointment-tab-${index}`,
    'aria-controls': `appointment-tabpanel-${index}`,
  };
}

const AppointmentsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAppointmentSelected = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAppointment(null);
  };

  const handleAppointmentCreated = () => {
    setIsFormOpen(false);
    // Refresh calendar data
  };

  const handleAppointmentUpdated = () => {
    // Refresh calendar data
  };

  return (
    <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        {(user?.role === 'admin' || user?.role === 'receptionist' || user?.role === 'doctor') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateAppointment}
          >
            New Appointment
          </Button>
        )}
      </Box>

      <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="appointment tabs"
            sx={{
              '& .MuiTab-root': {
                minWidth: 100,
              },
            }}
          >
            <Tab label="Calendar" {...a11yProps(0)} />
            <Tab label="List" {...a11yProps(1)} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <AppointmentCalendar
            userRole={user?.role}
            userId={user?._id}
            onAppointmentSelected={handleAppointmentSelected}
            onAppointmentCreated={handleAppointmentCreated}
            onAppointmentUpdated={handleAppointmentUpdated}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Appointment list view will be implemented here.
          </Typography>
        </TabPanel>
      </Paper>

      {isFormOpen && (
        <AppointmentForm
          open={isFormOpen}
          onClose={handleFormClose}
          appointment={selectedAppointment}
          onSave={selectedAppointment ? handleAppointmentUpdated : handleAppointmentCreated}
          userRole={user?.role}
          userId={user?._id}
        />
      )}
    </Box>
  );
};

export default AppointmentsPage; 