import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'dentist' | 'staff';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'dentist' | 'staff';
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        setUser(response.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Axios interceptor for handling token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await axios.post('/api/auth/refresh-token');
            return axios(originalRequest);
          } catch (refreshError) {
            setUser(null);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/login', { email, password });
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'dentist' | 'staff';
  }) => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/register', userData);
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await axios.post('/api/auth/logout');
      setUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during logout');
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await axios.post('/api/auth/forgot-password', { email });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while processing your request');
      throw err;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      setError(null);
      await axios.post('/api/auth/reset-password', { token, newPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while resetting your password');
      throw err;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      setError(null);
      await axios.post('/api/auth/verify-email', { token });
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred while verifying your email');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 