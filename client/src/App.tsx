import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';

import Layout from '@components/Layout';
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
import Payments from '@pages/payments';
import PaymentDetails from '@pages/payments/PaymentDetails';
import Settings from '@pages/settings';
import Profile from '@pages/profile';
import NotFound from '@pages/NotFound';

const App = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/:id" element={<AppointmentDetails />} />
            
            <Route path="/payments" element={<Payments />} />
            <Route path="/payments/:id" element={<PaymentDetails />} />
            
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Router>
  );
};

export default App; 