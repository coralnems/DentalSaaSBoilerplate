import axios from 'axios';
import { offlineStorage } from './offlineStorage';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and offline mode
api.interceptors.response.use(
  async (response) => {
    // If it's a GET request for patients, store the data locally
    if (response.config.method === 'get' && response.config.url?.includes('/patients')) {
      if (Array.isArray(response.data.patients)) {
        for (const patient of response.data.patients) {
          await offlineStorage.storePatient(patient);
        }
      } else if (response.data._id) {
        await offlineStorage.storePatient(response.data);
      }
    }
    return response;
  },
  async (error) => {
    // Handle offline mode
    if (!navigator.onLine || error.message === 'Network Error') {
      const { config } = error;
      
      // For GET requests, try to fetch from local storage
      if (config.method === 'get') {
        if (config.url?.includes('/patients/')) {
          const patientId = config.url.split('/').pop();
          const patient = await offlineStorage.getPatient(patientId);
          if (patient) {
            return Promise.resolve({ data: patient });
          }
        } else if (config.url?.includes('/patients')) {
          const patients = await offlineStorage.getAllPatients();
          return Promise.resolve({ 
            data: { 
              patients,
              pagination: {
                total: patients.length,
                page: 1,
                limit: patients.length
              }
            } 
          });
        }
      }
      
      // For write operations, store in sync queue
      if (['post', 'put', 'delete'].includes(config.method)) {
        await offlineStorage.addToSyncQueue({
          operation: config.method.toUpperCase() as 'CREATE' | 'UPDATE' | 'DELETE',
          endpoint: config.url!,
          data: config.data ? JSON.parse(config.data) : null,
          timestamp: Date.now()
        });
        
        // For POST/PUT, store the data locally as well
        if (['post', 'put'].includes(config.method) && config.data) {
          const data = JSON.parse(config.data);
          if (!data._id) {
            data._id = `temp_${Date.now()}`; // Temporary ID for new records
          }
          await offlineStorage.storePatient(data);
          return Promise.resolve({ data });
        }
        
        return Promise.resolve({ 
          data: { message: 'Operation queued for sync' } 
        });
      }
    }
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Add online/offline event listeners
window.addEventListener('online', async () => {
  try {
    await offlineStorage.fullSync();
  } catch (error) {
    console.error('Failed to sync data:', error);
  }
});

export { api }; 