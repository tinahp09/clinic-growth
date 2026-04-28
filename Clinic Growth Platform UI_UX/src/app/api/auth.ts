import api from './client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  clinicName: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface OTPSendData {
  phone: string;
  tenantId: string;
}

interface OTPVerifyData {
  phone: string;
  otp: string;
  tenantId: string;
}

interface AuthResponse {
  status: number;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    clinicId?: string;
    clinicName?: string;
    username: string;
    role: string;
  };
}

interface OTPResponse {
  message: string;
  patientId: string;
  debugOtp?: string;
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/login`, data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/register`, data);
    return response.data;
  },

  sendOTP: async (data: OTPSendData): Promise<OTPResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/otp`, data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/verify-otp`, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(`${BASE_URL}/v1/auth/logout`);
  },

  me: async () => {
    const response = await api.get(`${BASE_URL}/v1/auth/me`);
    return response.data;
  },
};

export default authApi;