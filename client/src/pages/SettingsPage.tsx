import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Tabs,
  Tab,
  Paper,
  Divider,
} from '@mui/material';
import ProfileSettings from '../components/settings/ProfileSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import AdminSettings from '../components/settings/AdminSettings';
import DoctorSettings from '../components/settings/DoctorSettings';
import ReceptionistSettings from '../components/settings/ReceptionistSettings';
import PatientSettings from '../components/settings/PatientSettings';
import { useAuth } from '../hooks/useAuth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Get user role from the user object
  const userRole = user?.role || '';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderRoleSpecificSettings = () => {
    switch (userRole) {
      case 'admin':
        return <AdminSettings />;
      case 'doctor':
        return <DoctorSettings />;
      case 'receptionist':
        return <ReceptionistSettings />;
      case 'patient':
        return <PatientSettings />;
      default:
        return null;
    }
  };

  const renderRoleSpecificTab = () => {
    let label = '';
    
    switch (userRole) {
      case 'admin':
        label = 'Admin Settings';
        break;
      case 'doctor':
        label = 'Doctor Preferences';
        break;
      case 'receptionist':
        label = 'Receptionist Preferences';
        break;
      case 'patient':
        label = 'Patient Preferences';
        break;
      default:
        return null;
    }
    
    return (
      <Tab label={label} {...a11yProps(2)} />
    );
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6">
            Please log in to access your settings.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Manage your account settings and preferences
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="settings tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Profile" {...a11yProps(0)} />
              <Tab label="Security" {...a11yProps(1)} />
              {renderRoleSpecificTab()}
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <ProfileSettings />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <SecuritySettings />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderRoleSpecificSettings()}
          </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsPage; 