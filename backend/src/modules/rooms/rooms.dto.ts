import { z } from 'zod';

export const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Room name must be at least 3 characters'),
    description: z.string().optional(),
    capacity: z.number().int().positive('Capacity must be a positive number'),
    location: z.string().min(3, 'Location is required'),
    amenities: z.array(z.string()).optional().default([]),
    price: z.number().nonnegative().optional().default(0),
    imageUrl: z.string().url().optional(),
  }),
});

export const updateRoomSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    location: z.string().min(3).optional(),
    amenities: z.array(z.string()).optional(),
    price: z.number().nonnegative().optional(),
    imageUrl: z.string().url().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getRoomSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const searchRoomsSchema = z.object({
  query: z.object({
    // Search filters
    name: z.string().optional(),
    location: z.string().optional(),
    capacity: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    amenities: z.string().optional(), // comma-separated
    maxPrice: z.string().optional(),
    
    // Pagination parameters
    page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1).refine(val => val > 0, 'Page must be greater than 0'),
    limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10).refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
    
    // Sorting parameters
    sortBy: z.enum(['name', 'location', 'capacity', 'price', 'createdAt']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateRoomDto = z.infer<typeof createRoomSchema>['body'];
export type UpdateRoomDto = z.infer<typeof updateRoomSchema>['body'];
export type SearchRoomsDto = z.infer<typeof searchRoomsSchema>['query'];

// Pagination response type
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
