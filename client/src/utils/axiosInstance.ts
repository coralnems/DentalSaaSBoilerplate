import axios from 'axios';
import store from '../store';
import { logout } from '../store/slices/authSlice';
import { showNotification } from '../store/slices/uiSlice';

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is a 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, so log the user out
          store.dispatch(logout());
          store.dispatch(showNotification({
            message: 'Your session has expired. Please log in again.',
            type: 'warning'
          }));
          
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/refresh-token`,
          { refreshToken }
        );
        
        // Store the new tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the authorization header and retry the request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // If refreshing the token fails, log the user out
        store.dispatch(logout());
        store.dispatch(showNotification({
          message: 'Your session has expired. Please log in again.',
          type: 'warning'
        }));
        
        return Promise.reject(error);
      }
    }
    
    // If it's a 403 (Forbidden)
    if (error.response?.status === 403) {
      store.dispatch(showNotification({
        message: 'You do not have permission to perform this action.',
        type: 'error'
      }));
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      store.dispatch(showNotification({
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'error'
      }));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      store.dispatch(showNotification({
        message: 'The request timed out. Please try again.',
        type: 'error'
      }));
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 