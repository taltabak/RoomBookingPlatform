import { z } from 'zod';

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
  }),
});

export const approveUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    approve: z.boolean(),
    notes: z.string().optional(),
  }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>['body'];
export type ApproveUserDto = z.infer<typeof approveUserSchema>['body'];
