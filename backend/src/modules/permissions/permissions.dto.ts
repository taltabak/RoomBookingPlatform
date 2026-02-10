import { z } from 'zod';

export const createPermissionRequestSchema = z.object({
  body: z.object({
    requestType: z.enum(['MULTIPLE_ROOMS', 'EXTENDED_DURATION']),
    reason: z.string().min(10, 'Reason must be at least 10 characters'),
    requestedValue: z.number().int().positive().optional(), // For extended duration in minutes
  }),
});

export const reviewPermissionRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    approve: z.boolean(),
    reviewNotes: z.string().optional(),
  }),
});

export const getPermissionRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type CreatePermissionRequestDto = z.infer<typeof createPermissionRequestSchema>['body'];
export type ReviewPermissionRequestDto = z.infer<typeof reviewPermissionRequestSchema>['body'];
