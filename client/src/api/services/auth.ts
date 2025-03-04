import axios from '../axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

interface ResetPasswordData {
  token: string;
  password: string;
}

interface PasskeyRegistrationOptions {
  challenge: string;
  rpId: string;
  userId: string;
  userName: string;
  attestation?: AttestationConveyancePreference;
}

interface PasskeyAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: PublicKeyCredentialDescriptor[];
}

interface QRCodeAuthResponse {
  qrCode: string;
  sessionToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post('/auth/logout');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await axios.post('/auth/reset-password', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await axios.post('/auth/verify-email', { token });
    return response.data;
  },

  refreshToken: async () => {
    const response = await axios.post('/auth/refresh-token');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<RegisterData>) => {
    const response = await axios.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await axios.put('/auth/change-password', data);
    return response.data;
  },

  setupMFA: async () => {
    const response = await axios.post('/auth/mfa/setup');
    return response.data;
  },

  verifyMFA: async (token: string) => {
    const response = await axios.post('/auth/mfa/verify', { token });
    return response.data;
  },

  disableMFA: async (token: string) => {
    const response = await axios.post('/auth/mfa/disable', { token });
    return response.data;
  },

  getQRCode: async (): Promise<QRCodeAuthResponse> => {
    const response = await axios.post('/auth/qr-code/generate');
    return response.data;
  },

  verifyQRCode: async (sessionToken: string) => {
    const response = await axios.post('/auth/qr-code/verify', { sessionToken });
    return response.data;
  },

  pollQRCodeStatus: async (sessionToken: string) => {
    const response = await axios.get(`/auth/qr-code/status/${sessionToken}`);
    return response.data;
  },

  getPasskeyRegistrationOptions: async (): Promise<PasskeyRegistrationOptions> => {
    const response = await axios.post('/auth/passkey/registration-options');
    return response.data;
  },

  registerPasskey: async (credential: any) => {
    const response = await axios.post('/auth/passkey/register', { credential });
    return response.data;
  },

  getPasskeyAuthenticationOptions: async (): Promise<PasskeyAuthenticationOptions> => {
    const response = await axios.post('/auth/passkey/authentication-options');
    return response.data;
  },

  authenticateWithPasskey: async (credential: any) => {
    const response = await axios.post('/auth/passkey/authenticate', { credential });
    return response.data;
  },

  initiateAuthentikAuth: async () => {
    const response = await axios.get('/auth/authentik/initiate');
    return response.data;
  },

  handleAuthentikCallback: async (code: string, state: string) => {
    const response = await axios.post('/auth/authentik/callback', { code, state });
    return response.data;
  },

  linkAuthentikAccount: async () => {
    const response = await axios.post('/auth/authentik/link');
    return response.data;
  },

  unlinkAuthentikAccount: async () => {
    const response = await axios.post('/auth/authentik/unlink');
    return response.data;
  },
}; 