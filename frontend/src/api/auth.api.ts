import { apiClient } from './axios.config';
import { AuthResponse, User } from '../types';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'ROOM_OWNER';
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterData) => 
    apiClient.post<{ user: User; message: string }>('/auth/register', data),

  login: (data: LoginData) => 
    apiClient.post<AuthResponse>('/auth/login', data),

  logout: (refreshToken: string) => 
    apiClient.post('/auth/logout', { refreshToken }),

  refreshToken: (refreshToken: string) => 
    apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),

  me: () => 
    apiClient.get<{ user: User }>('/auth/me'),
};
