import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

// Import Layout components directly
import Layout from '@components/Layout/index';
import PrivateRoute from '@components/PrivateRoute';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import ForgotPassword from '@pages/auth/ForgotPassword';
import ResetPassword from '@pages/auth/ResetPassword';
import Dashboard from '@pages/dashboard';
import Patients from '@pages/patients';
import PatientDetails from '@pages/patients/PatientDetails';
import Appointments from '@pages/appointments';
import AppointmentDetails from '@pages/appointments/AppointmentDetails';
import Treatments from '@pages/treatments';
import Payments from '@pages/payments';
import PaymentDetails from '@pages/payments/PaymentDetails';
import Settings from '@pages/settings';
import Profile from '@pages/profile';
import NotFound from '@pages/NotFound';

const App = () => {
  return (
    <Routes>
      {/* Public Routes - No flex container */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes with Layout - Flex container */}
      <Route path="/" element={
        <PrivateRoute>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Layout />
          </Box>
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="patients" element={<Patients />} />
        <Route path="patients/:id" element={<PatientDetails />} />
        
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/:id" element={<AppointmentDetails />} />
        
        <Route path="treatments" element={<Treatments />} />
        
        <Route path="payments" element={<Payments />} />
        <Route path="payments/:id" element={<PaymentDetails />} />
        
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 