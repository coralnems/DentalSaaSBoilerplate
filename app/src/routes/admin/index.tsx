import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import Dashboard from '../../pages/admin/Dashboard';
import TenantsList from '../../pages/admin/tenants/TenantsList';
import TenantDetails from '../../pages/admin/tenants/TenantDetails';
import TenantSettings from '../../pages/admin/tenants/TenantSettings';
import TenantBilling from '../../pages/admin/tenants/TenantBilling';
import TenantUsers from '../../pages/admin/tenants/TenantUsers';
import TenantIntegrations from '../../pages/admin/tenants/TenantIntegrations';
import TenantAnalytics from '../../pages/admin/tenants/TenantAnalytics';
import SystemSettings from '../../pages/admin/settings/SystemSettings';
import PaymentGateways from '../../pages/admin/settings/PaymentGateways';
import AuditLogs from '../../pages/admin/settings/AuditLogs';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="tenants">
          <Route index element={<TenantsList />} />
          <Route path=":id">
            <Route index element={<TenantDetails />} />
            <Route path="settings" element={<TenantSettings />} />
            <Route path="billing" element={<TenantBilling />} />
            <Route path="users" element={<TenantUsers />} />
            <Route path="integrations" element={<TenantIntegrations />} />
            <Route path="analytics" element={<TenantAnalytics />} />
          </Route>
        </Route>
        <Route path="settings">
          <Route index element={<SystemSettings />} />
          <Route path="payment-gateways" element={<PaymentGateways />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>
    </Routes>
  );
} 