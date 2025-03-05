import api from './axios';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Token constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/login', credentials);
    const data = response.data;
    
    // Normalize response structure
    const normalizedResponse: AuthResponse = this.normalizeAuthResponse(data);
    
    // Store tokens in HTTP-only cookies (handled by the server)
    // We still keep a copy in memory for the current session
    this.setTokens(normalizedResponse.accessToken, normalizedResponse.refreshToken || '');
    
    return normalizedResponse;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<any>('/auth/register', data);
    const responseData = response.data;
    
    // Normalize response structure
    const normalizedResponse: AuthResponse = this.normalizeAuthResponse(responseData);
    
    // Store tokens in HTTP-only cookies (handled by the server)
    // We still keep a copy in memory for the current session
    this.setTokens(normalizedResponse.accessToken, normalizedResponse.refreshToken || '');
    
    return normalizedResponse;
  },

  async logout(): Promise<void> {
    try {
      // Server will clear HTTP-only cookies
      await api.post('/auth/logout');
    } finally {
      // Clear local storage tokens
      this.clearTokens();
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const response = await api.post<{ accessToken: string }>('/auth/refresh', {
        refreshToken,
      });
      
      const { accessToken } = response.data;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      return accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Remove legacy token if it exists
    localStorage.removeItem('dental_clinic_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },
  
  normalizeAuthResponse(data: any): AuthResponse {
    // Handle different response formats from the server
    const accessToken = data.accessToken || data.token || '';
    const refreshToken = data.refreshToken || '';
    
    // Extract user data from response or from token
    let user: User;
    
    if (data.user) {
      // If user object is provided directly
      user = {
        id: data.user.id || data.user._id || '',
        email: data.user.email || '',
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        role: data.user.role || ''
      };
    } else {
      // If user data is at the root level
      user = {
        id: data._id || data.id || '',
        email: data.email || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        role: data.role || ''
      };
    }
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
};

export default authService; 