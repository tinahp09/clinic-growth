import api from './client';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ClientRegisterOTPData {
  fullName: string;
  mobile: string;
}

interface ClientVerifyData {
  fullName?: string;
  mobile: string;
  otp: string;
}

interface ClientLoginOTPData {
  mobile: string;
}

interface AuthResponse {
  status: number;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  patient?: {
    id: string;
    fullName: string;
    mobile: string;
  };
  debugOtp?: string;
}

export const clientAuthApi = {
  registerOTP: async (data: ClientRegisterOTPData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/client/register/otp`, data);
    return response.data;
  },

  registerVerify: async (data: ClientVerifyData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/client/register/verify`, data);
    return response.data;
  },

  loginOTP: async (data: ClientLoginOTPData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/client/login/otp`, data);
    return response.data;
  },

  loginVerify: async (data: ClientVerifyData): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/client/login/verify`, data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post(`${BASE_URL}/v1/auth/client/refresh`, { refreshToken });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post(`${BASE_URL}/v1/auth/client/logout`);
  },
};

export default clientAuthApi;