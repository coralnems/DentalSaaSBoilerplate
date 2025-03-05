import axios from 'axios';
import { offlineStorage } from './offlineStorage';
import { getToken, removeToken, setToken } from './auth';

// Use Vite's environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
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
      removeToken();
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

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      setToken(response.data.token);
    }
    return response.data;
  },
  
  getCurrentUser: async () => {
    return api.get('/auth/me').then(response => response.data);
  },
  
  logout: () => {
    removeToken();
  }
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    return api.get('/users/profile').then(response => response.data);
  },
  
  updateProfile: async (userData: any) => {
    return api.put('/users/profile', userData).then(response => response.data);
  },
  
  updatePassword: async (passwordData: { currentPassword: string, newPassword: string }) => {
    return api.put('/users/password', passwordData).then(response => response.data);
  },
  
  getPreferences: async () => {
    return api.get('/users/preferences').then(response => response.data);
  },
  
  updatePreferences: async (preferences: any) => {
    return api.put('/users/preferences', { preferences }).then(response => response.data);
  },
  
  updateTwoFactorAuth: async (enabled: boolean) => {
    return api.put('/users/security/2fa', { enabled }).then(response => response.data);
  },
  
  getAllUsers: async (params: { page?: number, limit?: number, role?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.role) queryParams.append('role', params.role);
    
    const url = `/users?${queryParams.toString()}`;
    return api.get(url).then(response => response.data);
  }
};

// Patient API calls
export const patientAPI = {
  getAllPatients: async () => {
    return api.get('/patients').then(response => response.data);
  },
  
  getPatientById: async (id: string) => {
    return api.get(`/patients/${id}`).then(response => response.data);
  },
  
  createPatient: async (patientData: any) => {
    return api.post('/patients', patientData).then(response => response.data);
  },
  
  updatePatient: async (id: string, patientData: any) => {
    return api.put(`/patients/${id}`, patientData).then(response => response.data);
  },
  
  deletePatient: async (id: string) => {
    return api.delete(`/patients/${id}`).then(response => response.data);
  }
};

// Appointment API calls
export const appointmentAPI = {
  getAllAppointments: async (params: any = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.search) queryParams.append('search', params.search);
    
    const url = `/appointments?${queryParams.toString()}`;
    return api.get(url).then(response => response.data);
  },
  
  getAppointmentById: async (id: string) => {
    return api.get(`/appointments/${id}`).then(response => response.data);
  },
  
  createAppointment: async (appointmentData: any) => {
    return api.post('/appointments', appointmentData).then(response => response.data);
  },
  
  updateAppointment: async (id: string, appointmentData: any) => {
    return api.put(`/appointments/${id}`, appointmentData).then(response => response.data);
  },
  
  deleteAppointment: async (id: string) => {
    return api.delete(`/appointments/${id}`).then(response => response.data);
  },
  
  cancelAppointment: async (id: string, reason: string) => {
    return api.post(`/appointments/${id}/cancel`, { reason }).then(response => response.data);
  },
  
  rescheduleAppointment: async (id: string, newDate: string) => {
    return api.post(`/appointments/${id}/reschedule`, { newDate }).then(response => response.data);
  },
  
  getAppointmentsByDentist: async (dentistId: string) => {
    return api.get(`/appointments/dentist/${dentistId}`).then(response => response.data);
  },
  
  getAppointmentsByPatient: async (patientId: string) => {
    return api.get(`/appointments/patient/${patientId}`).then(response => response.data);
  },
  
  getAppointmentsByDateRange: async (startDate: string, endDate: string) => {
    return api.get(`/appointments/date-range?startDate=${startDate}&endDate=${endDate}`).then(response => response.data);
  }
};

export default api; 