import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Sheet, Stack } from '@mui/joy';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

export default function AdminLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
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
        <AdminHeader />
        <Sheet
          sx={{
            flex: 1,
            mx: 2,
            mb: 2,
            borderRadius: 'sm',
            p: 2,
            overflow: 'auto',
          }}
        >
          <Stack spacing={2}>
            <Outlet />
          </Stack>
        </Sheet>
      </Box>
    </Box>
  );
} 