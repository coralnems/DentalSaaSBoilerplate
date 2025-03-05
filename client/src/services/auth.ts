import { jwtDecode } from 'jwt-decode';

// Token constants - must match those in api/auth.ts
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Set authentication token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Get authentication token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('dental_clinic_token'); // Remove legacy token for backward compatibility
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  
  if (!token) {
    return false;
  }
  
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      removeToken();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    removeToken();
    return false;
  }
};

/**
 * Get user info from token
 */
export const getUserInfo = (): any | null => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded: any = jwtDecode(token);
    return {
      _id: decoded.id || decoded._id || decoded.sub,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user role from token
 */
export const getUserRole = (): string | null => {
  const userInfo = getUserInfo();
  return userInfo ? userInfo.role : null;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (role: string | string[]): boolean => {
  const userRole = getUserRole();
  
  if (!userRole) {
    return false;
  }
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
}; 