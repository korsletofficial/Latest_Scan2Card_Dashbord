import { apiClient } from './axios.config';
import type { LoginCredentials, AuthResponse, RefreshTokenResponse } from '../types/auth.types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  },

  verifyOTP: async (userId: string, otp: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { userId, otp });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'OTP verification failed');
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      // Use axios directly without interceptor to avoid infinite loop
      const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Token refresh failed');
      }
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || 'Failed to get profile');
      }
      throw error;
    }
  },
};

export default authAPI;
