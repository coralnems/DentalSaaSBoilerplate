import React from 'react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';

import { RootState } from '@store/index';
import AppSidebar from './Sidebar';
import Notifications from '../Notifications';

// Update the interface to match what's in the Sidebar.tsx file
interface HeaderProps {
  drawerWidth?: number;
  onDrawerToggle: () => void;
}

// Update the interface to match what's in the Sidebar.tsx file
interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  open: boolean;
}

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawerWidth = 320; // Increased from 280 to 320 for a wider sidebar

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onDrawerToggle={handleDrawerToggle}
        open={sidebarOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Outlet />
        <Notifications />
      </Box>
    </Box>
  );
};

export default Layout; 