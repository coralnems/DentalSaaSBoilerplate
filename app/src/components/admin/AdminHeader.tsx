import React from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Badge,
  Tooltip,
} from '@mui/joy';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

export default function AdminHeader() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ flex: 1 }} />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Tooltip title="Notifications" variant="soft">
          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
          >
            <Badge badgeContent={3} color="danger">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        <Menu>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'outlined', color: 'neutral', size: 'sm' } }}
          >
            <Avatar
              size="sm"
              src={user?.avatar}
              alt={user?.firstName}
            />
          </MenuButton>
          <MenuItem>
            <PersonIcon />
            <Typography level="body-sm">Profile</Typography>
          </MenuItem>
          <MenuItem>
            <SettingsIcon />
            <Typography level="body-sm">Settings</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} color="danger">
            <LogoutIcon />
            <Typography level="body-sm">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
} 