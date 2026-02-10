import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    roomId: z.string().uuid('Invalid room ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  }),
});

export const createBookingSchemaWithSlot = z.object({
  body: z.object({
    slotId: z.string().uuid('Invalid slot ID'),
    roomId: z.string().uuid('Invalid room ID'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  }),
});

export const getBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const getRoomBookingsSchema = z.object({
  params: z.object({
    roomId: z.string().uuid(),
  }),
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>['body'];
export type CreateBookingWithSlotDto = z.infer<typeof createBookingSchemaWithSlot>['body'];
export type GetRoomBookingsDto = z.infer<typeof getRoomBookingsSchema>['query'];
