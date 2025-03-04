import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import MedicalInformationRoundedIcon from '@mui/icons-material/MedicalInformationRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import InsuranceRoundedIcon from '@mui/icons-material/HealthAndSafetyRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import { useAuth } from '../hooks/useAuth';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
  { path: '/dashboard/patients', label: 'Patients', icon: <PeopleRoundedIcon /> },
  { path: '/dashboard/appointments', label: 'Appointments', icon: <CalendarMonthRoundedIcon /> },
  { path: '/dashboard/treatments', label: 'Treatments', icon: <MedicalInformationRoundedIcon /> },
  { path: '/dashboard/payments', label: 'Payments', icon: <PaymentsRoundedIcon /> },
  { path: '/dashboard/insurance', label: 'Insurance', icon: <InsuranceRoundedIcon /> },
  { path: '/dashboard/analytics', label: 'Analytics', icon: <AnalyticsRoundedIcon /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'dentist') {
      return !['analytics'].includes(item.path.split('/').pop() || '');
    }
    if (user?.role === 'staff') {
      return !['analytics', 'treatments'].includes(item.path.split('/').pop() || '');
    }
    return false;
  });

  return (
    <Sheet
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s',
        zIndex: 1000,
        height: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <List
        sx={{
          '--ListItem-radius': '8px',
          '--ListItem-minHeight': '48px',
          '--List-gap': '8px',
        }}
      >
        {filteredMenuItems.map((item) => (
          <ListItem key={item.path}>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemDecorator>{item.icon}</ListItemDecorator>
              <ListItemContent>
                <Typography level="body-sm">{item.label}</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ flex: 1 }} />

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          px: 2,
          pb: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          pt: 2,
        }}
      >
        <Box>
          <Typography level="body-xs" fontWeight="bold">
            {user?.role.toUpperCase()}
          </Typography>
          <Typography level="body-xs">v1.0.0</Typography>
        </Box>
      </Box>
    </Sheet>
  );
} 