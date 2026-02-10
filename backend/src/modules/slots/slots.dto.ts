import { z } from 'zod';

export const generateSlotsSchema = z.object({
  params: z.object({
    roomId: z.string().uuid(),
  }),
  body: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    slotDuration: z.number().int().positive().default(60), // minutes
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format').default('09:00'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format').default('18:00'),
  }),
});

export const getSlotsSchema = z.object({
  params: z.object({
    roomId: z.string().uuid(),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
});

export const getAvailableSlotsSchema = z.object({
  query: z.object({
    roomId: z.string().uuid().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }),
});

export type GenerateSlotsDto = z.infer<typeof generateSlotsSchema>['body'];
export type GetSlotsDto = z.infer<typeof getSlotsSchema>['query'];
export type GetAvailableSlotsDto = z.infer<typeof getAvailableSlotsSchema>['query'];
