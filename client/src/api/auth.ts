import api from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
}

export interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  token: string;
  user?: {
    id?: string;
    _id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

// Token constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    const data = response.data;
    
    // Store tokens consistently
    if (data.token) {
      this.setTokens(data.token, data.refreshToken || '');
    } else if (data.accessToken) {
      this.setTokens(data.accessToken, data.refreshToken || '');
    }
    
    const normalizedResponse: AuthResponse = {
      ...data,
      user: {
        id: data._id,
        _id: data._id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      }
    };
    
    return normalizedResponse;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    const responseData = response.data;
    
    // Store tokens consistently
    if (responseData.token) {
      this.setTokens(responseData.token, responseData.refreshToken || '');
    } else if (responseData.accessToken) {
      this.setTokens(responseData.accessToken, responseData.refreshToken || '');
    }
    
    const normalizedResponse: AuthResponse = {
      ...responseData,
      user: {
        id: responseData._id,
        _id: responseData._id,
        email: responseData.email,
        firstName: responseData.firstName,
        lastName: responseData.lastName,
        role: responseData.role
      }
    };
    
    return normalizedResponse;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
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
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    
    const accessToken = response.data.accessToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    return accessToken;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('dental_clinic_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

export default authService; 