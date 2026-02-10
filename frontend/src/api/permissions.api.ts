import { apiClient } from './axios.config';
import { PermissionRequest } from '../types';

export interface CreatePermissionRequestData {
  requestType: 'MULTIPLE_ROOMS' | 'EXTENDED_DURATION';
  reason: string;
  requestedValue?: number;
}

export interface ReviewPermissionData {
  approve: boolean;
  reviewNotes?: string;
}

export const permissionsApi = {
  create: (data: CreatePermissionRequestData) => 
    apiClient.post<{ request: PermissionRequest }>('/permissions', data),

  getMyRequests: () => 
    apiClient.get<{ requests: PermissionRequest[] }>('/permissions/my-requests'),

  getAll: () => 
    apiClient.get<{ requests: PermissionRequest[] }>('/permissions'),

  getPending: () => 
    apiClient.get<{ requests: PermissionRequest[] }>('/permissions/pending'),

  getById: (id: string) => 
    apiClient.get<{ request: PermissionRequest }>(`/permissions/${id}`),

  review: (id: string, data: ReviewPermissionData) => 
    apiClient.patch<{ request: PermissionRequest; message: string }>(
      `/permissions/${id}/review`,
      data
    ),
};
