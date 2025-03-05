import axios from 'axios';

// Environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || 
                import.meta.env.REACT_APP_API_URL || 
                window.location.origin.includes('localhost') ? 
                  'http://localhost:5000/api' : 
                  `${window.location.origin}/api`;

// Token constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // First try to get token from localStorage (for backward compatibility)
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Create a standardized error object
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'An unexpected error occurred',
      data: error.response?.data || {},
      originalError: error
    };

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await api.post('/auth/refresh', {
          refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
        });

        const { accessToken } = response.data;
        
        // Update token in localStorage
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout user
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        
        // Only redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          // Store the current path to redirect back after login
          sessionStorage.setItem('redirectPath', window.location.pathname);
          window.location.href = '/login';
        }
        
        return Promise.reject({
          ...errorResponse,
          message: 'Your session has expired. Please log in again.',
          originalError: refreshError
        });
      }
    }

    // Handle other error types
    if (error.response?.status === 404) {
      errorResponse.message = 'The requested resource was not found';
    } else if (error.response?.status === 403) {
      errorResponse.message = 'You do not have permission to access this resource';
    } else if (error.response?.status >= 500) {
      errorResponse.message = 'A server error occurred. Please try again later.';
    } else if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'The request timed out. Please check your internet connection.';
    } else if (!error.response) {
      errorResponse.message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(errorResponse);
  }
);

export default api; 