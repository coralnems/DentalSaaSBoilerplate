import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { AuthResponse, RegisterData, User } from '@api/auth';
import { getUserInfo, getUserRole, isAuthenticated as checkAuth } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (checkAuth()) {
          // Get user info from the token
          const userInfo = getUserInfo();
          setUser(userInfo);
          
          // Get user role from the token
          const role = getUserRole();
          setUserRole(role);
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setUserRole(null);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      clearError();
      const response = await authService.login({ email, password });
      setUser(response.user);
      setUserRole(response.user.role);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      clearError();
      const response = await authService.register(data);
      setUser(response.user);
      setUserRole(response.user.role);
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      clearError();
      await authService.logout();
      setUser(null);
      setUserRole(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Logout failed. Please try again.';
      setError(errorMessage);
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    userRole,
    login,
    register,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 