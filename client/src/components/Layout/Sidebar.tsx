import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  Switch,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  Payment as PaymentIcon,
  Settings as SettingsIcon,
  LocalHospital as LocalHospitalIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  MenuOutlined,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/uiSlice';
import authService from '../../api/auth';
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { RootState } from '@store/index';

// Logo image URL - replace with your actual logo
const logoUrl = 'https://i.imgur.com/6hQMVQG.png'; // Default dental logo placeholder
// User profile image URL - you can replace with actual user image later
const userProfileUrl = 'https://i.imgur.com/zfTKQQs.jpg'; // Default user avatar placeholder

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  open: boolean;
}

const AppSidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, onDrawerToggle, open }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = React.useState(!open);
  
  // Get dark mode state from Redux
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const isDarkMode = darkMode;

  // Update collapsed state when open prop changes
  React.useEffect(() => {
    setCollapsed(!open);
  }, [open]);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Patients', icon: <PeopleIcon />, path: '/patients' },
    { text: 'Appointments', icon: <EventIcon />, path: '/appointments' },
    { text: 'Treatments', icon: <LocalHospitalIcon />, path: '/treatments' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/payments' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const handleLogout = async () => {
    try {
      // Call the auth service logout method
      await authService.logout();
      
      // Dispatch Redux action to update state
      dispatch(logout());
      
      // Clear any tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('dental_clinic_token');
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('dental_clinic_token');
      dispatch(logout());
      navigate('/login');
    }
  };

  // Toggle dark mode using Redux
  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
  };

  // Custom colors based on theme
  const colors = {
    sidebar: {
      // Change background color to a purple shade for dark mode
      background: theme.palette.mode === 'dark' ? '#2D1B4E' : '#ffffff',
      color: theme.palette.mode === 'dark' ? '#ffffff' : '#607489',
      // Change active background to a purple shade
      activeBg: '#6A0DAD20',
      // Change active color to a rich purple
      activeColor: '#8A2BE2',
      // Create gradient background for hover instead of a solid color
      hoverBg: 'linear-gradient(45deg, rgba(138,43,226,0.1) 0%, rgba(106,13,173,0.2) 50%, rgba(155,79,235,0.1) 100%)',
      hoverColor: theme.palette.mode === 'dark' ? '#ffffff' : '#8A2BE2',
      footerBg: theme.palette.mode === 'dark' ? '#231040' : '#f6f9fc',
    }
  };

  // Custom icon button component
  const IconButton = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(0,0,0,0.08)',
        },
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        '& .ps-sidebar-container': {
          height: '100vh',
          width: !collapsed ? `${drawerWidth}px` : undefined,
        },
        '& .ps-sidebar-root': {
          border: 'none',
          boxShadow: theme.shadows[3],
        },
        '& .ps-menu-button': {
          height: '50px', // Consistent height for menu items
        },
        '& .ps-menu-button:hover': {
          // Apply gradient background on hover
          background: colors.sidebar.hoverBg,
          color: colors.sidebar.hoverColor,
          transition: 'all 0.3s ease',
        },
        '& .ps-active': {
          backgroundColor: `${colors.sidebar.activeBg} !important`,
          color: `${colors.sidebar.activeColor} !important`,
          fontWeight: 'bold !important',
        },
        // Additional styling for the sidebar
        '& .ps-menu-icon': {
          color: theme.palette.mode === 'dark' ? '#9B4FEB' : '#6A0DAD',
        },
        '& .ps-active .ps-menu-icon': {
          color: `${colors.sidebar.activeColor} !important`,
        },
        display: { xs: mobileOpen ? 'block' : 'none', md: 'block' },
        position: { xs: 'fixed', md: 'relative' },
        zIndex: { xs: theme.zIndex.drawer + 1, md: 'auto' },
        height: '100%',
        transition: 'all 0.3s ease',
      }}
    >
      <Sidebar
        width={`${drawerWidth}px`}
        collapsed={collapsed}
        backgroundColor={colors.sidebar.background}
        rootStyles={{
          color: colors.sidebar.color,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo and Toggle Section */}
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#3D276E' : theme.palette.divider}`,
            mb: 2,
            // Add a gradient background to the header
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(90deg, #2D1B4E 0%, #3D276E 100%)' 
              : 'linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)',
          }}
        >
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src={logoUrl} 
                alt="Dental Clinic Logo"
                sx={{ 
                  width: 40, 
                  height: 40,
                  backgroundColor: theme.palette.primary.main,
                  padding: '5px',
                }}
              />
              <Typography variant="h6" fontWeight="bold">
                Dental Clinic
              </Typography>
            </Box>
          )}
          {collapsed && (
            <Avatar 
              src={logoUrl}
              alt="Dental Clinic Logo"
              sx={{ 
                width: 40, 
                height: 40,
                mx: 'auto',
                backgroundColor: theme.palette.primary.main,
                padding: '5px',
              }}
            />
          )}
          <IconButton onClick={() => {
            setCollapsed(!collapsed);
            if (!isMobile) {
              onDrawerToggle();
            }
          }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
        
        {/* User Profile Section */}
        <Box 
          sx={{ 
            px: 2, 
            pb: 2, 
            display: 'flex', 
            flexDirection: collapsed ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 2,
            mb: 2,
            // Add subtle gradient background
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #3D276E 0%, #2D1B4E 100%)'
              : 'linear-gradient(180deg, #e9ecef 0%, #f8f9fa 100%)',
            borderRadius: '8px',
            py: 1,
          }}
        >
          <Avatar 
            src={userProfileUrl} 
            alt="User Avatar"
            sx={{ 
              width: 50, 
              height: 50,
              border: `2px solid #8A2BE2`,
              boxShadow: '0 0 10px rgba(138,43,226,0.3)',
            }}
          />
          {!collapsed && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">Dr. John Doe</Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>Admin</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />
        
        {/* Main Menu */}
        <Menu>
          {menuItems.map((item) => (
            <MenuItem
              key={item.text}
              icon={item.icon}
              onClick={() => handleNavigation(item.path)}
              active={location.pathname === item.path}
            >
              {item.text}
            </MenuItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          {/* Theme Toggle */}
          <MenuItem 
            icon={isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            onClick={handleToggleDarkMode}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            <Box sx={{ ml: 'auto' }}>
              <Switch 
                checked={isDarkMode}
                onChange={handleToggleDarkMode}
                size="small"
              />
            </Box>
          </MenuItem>
          
          {/* Logout */}
          <MenuItem
            icon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </MenuItem>
        </Menu>
        
        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.mode === 'dark' ? '#3D276E' : theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 'auto',
            backgroundColor: colors.sidebar.footerBg,
          }}
        >
          {!collapsed && (
            <>
              <Typography variant="body2" color="text.secondary" align="center">
                © 2024 Dental Clinic
              </Typography>
              <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
                Version 1.0.0
              </Typography>
            </>
          )}
        </Box>
      </Sidebar>
      
      {/* Overlay for mobile */}
      {isMobile && mobileOpen && (
        <Box 
          onClick={onDrawerToggle}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: -1,
          }}
        />
      )}
    </Box>
  );
};

export default AppSidebar; 