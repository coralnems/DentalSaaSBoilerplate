import React from 'react';
import Box from '@mui/joy/Box';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import Avatar from '@mui/joy/Avatar';
import Divider from '@mui/joy/Divider';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../hooks/useAuth';

interface HeaderProps {
  onSidebarToggle?: () => void;
}

export default function Header({ onSidebarToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        px: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'background.surface',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          variant="outlined"
          size="sm"
          onClick={onSidebarToggle}
          sx={{ display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography level="h4" component="h1">
          DentalCare
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Dropdown>
          <MenuButton
            variant="plain"
            size="sm"
            sx={{
              maxWidth: '200px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Avatar
              size="sm"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography level="body-sm" fontWeight="bold">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography level="body-xs">{user?.role}</Typography>
            </Box>
          </MenuButton>
          <Menu
            placement="bottom-end"
            size="sm"
            sx={{
              zIndex: 1101,
              mt: 1,
              minWidth: 200,
            }}
          >
            <MenuItem>
              <ListItemDecorator>
                <PersonRoundedIcon />
              </ListItemDecorator>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} color="danger">
              <ListItemDecorator sx={{ color: 'inherit' }}>
                <LogoutRoundedIcon />
              </ListItemDecorator>
              Logout
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  );
} 