import React from 'react';
import { Outlet } from 'react-router-dom';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <IconButton
      id="toggle-mode"
      size="lg"
      variant="soft"
      color="neutral"
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      sx={{
        position: 'fixed',
        zIndex: 999,
        top: '1rem',
        right: '1rem',
      }}
    >
      {mode === 'dark' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

export default function DashboardLayout() {
  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100vh',
            gap: 1,
          }}
        >
          <Header />
          
          <Sheet
            sx={{
              flex: 1,
              mx: 2,
              mb: 2,
              borderRadius: 'md',
              p: 2,
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Sheet>
        </Box>

        <ColorSchemeToggle />
      </Box>
    </CssVarsProvider>
  );
} 