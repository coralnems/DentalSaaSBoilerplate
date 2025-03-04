import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import PatientList from '../pages/patients/PatientList';
import PatientForm from '../components/patients/PatientForm';
import AppointmentList from '../pages/appointments/AppointmentList';
import AppointmentForm from '../components/appointments/AppointmentForm';
import Settings from '../pages/settings/Settings';
import Profile from '../pages/profile/Profile';
import { RootState } from '../store';

const AppRoutes: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/new" element={<PatientForm />} />
        <Route path="/patients/:id/edit" element={<PatientForm isEditing />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/new" element={<AppointmentForm />} />
        <Route path="/appointments/:id/edit" element={<AppointmentForm isEditing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes; 