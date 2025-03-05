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

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    
    const data = response.data;
    
    localStorage.setItem('dental_clinic_token', data.token);
    
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
    
    localStorage.setItem('dental_clinic_token', responseData.token);
    
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
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });
    localStorage.setItem('accessToken', response.data.accessToken);
    return response.data.accessToken;
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('dental_clinic_token');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken') || localStorage.getItem('dental_clinic_token');
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

export default authService; 