import { apiClient } from './axios.config';
import { Booking } from '../types';

export interface CreateBookingData {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const bookingsApi = {
  create: (data: CreateBookingData) => 
    apiClient.post<{ booking: Booking }>('/bookings', data),

  getMyBookings: () => 
    apiClient.get<{ bookings: Booking[] }>('/bookings'),

  getById: (id: string) => 
    apiClient.get<{ booking: Booking }>(`/bookings/${id}`),

  cancel: (id: string) => 
    apiClient.delete<{ booking: Booking; message: string }>(`/bookings/${id}`),

  getRoomBookings: (roomId: string, params?: { startDate?: string; endDate?: string }) => 
    apiClient.get<{ bookings: Booking[] }>(`/bookings/room/${roomId}`, { params }),
};
