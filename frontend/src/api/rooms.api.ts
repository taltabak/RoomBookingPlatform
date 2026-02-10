import { apiClient } from './axios.config';
import { Room } from '../types';

export interface SearchRoomsParams {
  name?: string;
  location?: string;
  capacity?: number;
  date?: string;
  startTime?: string;
  endTime?: string;
  amenities?: string;
  maxPrice?: number;
  // Pagination parameters
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'location' | 'capacity' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateRoomData {
  name: string;
  description?: string | null;
  capacity: number;
  location: string;
  amenities?: string[] | null;
  price?: number | null;
  imageUrl?: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedRoomsResponse {
  data: Room[];
  pagination: PaginationMeta;
}

export const roomsApi = {
  search: (params: SearchRoomsParams) => 
    apiClient.get<PaginatedRoomsResponse>('/rooms', { params }),

  getById: (id: string) => 
    apiClient.get<{ room: Room }>(`/rooms/${id}`),

  create: (data: CreateRoomData) => 
    apiClient.post<{ room: Room }>('/rooms', data),

  update: (id: string, data: Partial<CreateRoomData>) => 
    apiClient.patch<{ room: Room }>(`/rooms/${id}`, data),

  delete: (id: string) => 
    apiClient.delete<{ message: string }>(`/rooms/${id}`),

  getMyRooms: () => 
    apiClient.get<{ rooms: Room[] }>('/rooms/owner/me'),

  getAvailability: (id: string, date: string) => 
    apiClient.get<{ slots: any[] }>(`/slots/room/${id}?date=${date}`),
};
