import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // You can add any request transformations here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        await api.post('/auth/refresh-token');
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    refreshToken: '/auth/refresh-token',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  patients: {
    list: '/patients',
    create: '/patients',
    get: (id: string) => `/patients/${id}`,
    update: (id: string) => `/patients/${id}`,
    delete: (id: string) => `/patients/${id}`,
  },
  appointments: {
    list: '/appointments',
    create: '/appointments',
    get: (id: string) => `/appointments/${id}`,
    update: (id: string) => `/appointments/${id}`,
    delete: (id: string) => `/appointments/${id}`,
  },
  treatments: {
    list: '/treatments',
    create: '/treatments',
    get: (id: string) => `/treatments/${id}`,
    update: (id: string) => `/treatments/${id}`,
    delete: (id: string) => `/treatments/${id}`,
  },
  payments: {
    list: '/payments',
    create: '/payments',
    get: (id: string) => `/payments/${id}`,
    update: (id: string) => `/payments/${id}`,
    delete: (id: string) => `/payments/${id}`,
  },
  insurance: {
    list: '/insurance',
    create: '/insurance',
    get: (id: string) => `/insurance/${id}`,
    update: (id: string) => `/insurance/${id}`,
    delete: (id: string) => `/insurance/${id}`,
  },
};

export default api; 