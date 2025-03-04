// User roles
export type UserRole = 'admin' | 'dentist' | 'staff';

// Permission types
export type PermissionAction = 'create' | 'read' | 'update' | 'delete';
export type PermissionResource =
  | 'patients'
  | 'appointments'
  | 'treatments'
  | 'payments'
  | 'insurance'
  | 'users'
  | 'reports'
  | 'settings';

// Permission interface
export interface Permission {
  action: PermissionAction;
  resource: PermissionResource;
}

// Role-based permissions
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has full access to everything
    { action: 'create', resource: 'patients' },
    { action: 'read', resource: 'patients' },
    { action: 'update', resource: 'patients' },
    { action: 'delete', resource: 'patients' },
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'appointments' },
    { action: 'update', resource: 'appointments' },
    { action: 'delete', resource: 'appointments' },
    { action: 'create', resource: 'treatments' },
    { action: 'read', resource: 'treatments' },
    { action: 'update', resource: 'treatments' },
    { action: 'delete', resource: 'treatments' },
    { action: 'create', resource: 'payments' },
    { action: 'read', resource: 'payments' },
    { action: 'update', resource: 'payments' },
    { action: 'delete', resource: 'payments' },
    { action: 'create', resource: 'insurance' },
    { action: 'read', resource: 'insurance' },
    { action: 'update', resource: 'insurance' },
    { action: 'delete', resource: 'insurance' },
    { action: 'create', resource: 'users' },
    { action: 'read', resource: 'users' },
    { action: 'update', resource: 'users' },
    { action: 'delete', resource: 'users' },
    { action: 'read', resource: 'reports' },
    { action: 'create', resource: 'reports' },
    { action: 'read', resource: 'settings' },
    { action: 'update', resource: 'settings' },
  ],
  dentist: [
    // Dentist has full access to patients, appointments, and treatments
    { action: 'create', resource: 'patients' },
    { action: 'read', resource: 'patients' },
    { action: 'update', resource: 'patients' },
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'appointments' },
    { action: 'update', resource: 'appointments' },
    { action: 'delete', resource: 'appointments' },
    { action: 'create', resource: 'treatments' },
    { action: 'read', resource: 'treatments' },
    { action: 'update', resource: 'treatments' },
    // Read-only access to payments and insurance
    { action: 'read', resource: 'payments' },
    { action: 'read', resource: 'insurance' },
    // Read-only access to reports
    { action: 'read', resource: 'reports' },
  ],
  staff: [
    // Staff has limited access focused on appointments and basic patient info
    { action: 'create', resource: 'patients' },
    { action: 'read', resource: 'patients' },
    { action: 'update', resource: 'patients' },
    { action: 'create', resource: 'appointments' },
    { action: 'read', resource: 'appointments' },
    { action: 'update', resource: 'appointments' },
    { action: 'read', resource: 'treatments' },
    { action: 'create', resource: 'payments' },
    { action: 'read', resource: 'payments' },
    { action: 'read', resource: 'insurance' },
  ],
};

// Check if user has permission
export const hasPermission = (
  userRole: UserRole,
  action: PermissionAction,
  resource: PermissionResource
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some(
    (permission) => permission.action === action && permission.resource === resource
  );
};

// Get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  return ROLE_PERMISSIONS[role];
};

// Check if user has any permission for a resource
export const hasResourcePermission = (
  userRole: UserRole,
  resource: PermissionResource
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.some((permission) => permission.resource === resource);
};

// Get allowed actions for a resource
export const getAllowedActions = (
  userRole: UserRole,
  resource: PermissionResource
): PermissionAction[] => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions
    .filter((permission) => permission.resource === resource)
    .map((permission) => permission.action);
};

// Check if user can access a route
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  // Add route-specific permission checks here
  const routePermissions: Record<string, Permission[]> = {
    '/dashboard': [{ action: 'read', resource: 'patients' }],
    '/patients': [{ action: 'read', resource: 'patients' }],
    '/appointments': [{ action: 'read', resource: 'appointments' }],
    '/treatments': [{ action: 'read', resource: 'treatments' }],
    '/payments': [{ action: 'read', resource: 'payments' }],
    '/insurance': [{ action: 'read', resource: 'insurance' }],
    '/users': [{ action: 'read', resource: 'users' }],
    '/reports': [{ action: 'read', resource: 'reports' }],
    '/settings': [{ action: 'read', resource: 'settings' }],
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true; // If no permissions specified, allow access

  return requiredPermissions.every((permission) =>
    hasPermission(userRole, permission.action, permission.resource)
  );
};

// Get accessible routes for a role
export const getAccessibleRoutes = (userRole: UserRole): string[] => {
  const routes = [
    '/dashboard',
    '/patients',
    '/appointments',
    '/treatments',
    '/payments',
    '/insurance',
    '/users',
    '/reports',
    '/settings',
  ];

  return routes.filter((route) => canAccessRoute(userRole, route));
};

// Check if user can perform bulk actions
export const canPerformBulkAction = (
  userRole: UserRole,
  action: PermissionAction,
  resource: PermissionResource
): boolean => {
  // By default, only admins can perform bulk actions
  if (userRole !== 'admin') return false;
  return hasPermission(userRole, action, resource);
};

// Get permission description
export const getPermissionDescription = (permission: Permission): string => {
  const actionMap: Record<PermissionAction, string> = {
    create: 'Create',
    read: 'View',
    update: 'Edit',
    delete: 'Delete',
  };

  const resourceMap: Record<PermissionResource, string> = {
    patients: 'Patients',
    appointments: 'Appointments',
    treatments: 'Treatments',
    payments: 'Payments',
    insurance: 'Insurance',
    users: 'Users',
    reports: 'Reports',
    settings: 'Settings',
  };

  return `${actionMap[permission.action]} ${resourceMap[permission.resource]}`;
}; 