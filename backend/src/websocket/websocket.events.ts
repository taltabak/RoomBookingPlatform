export enum WebSocketEvents {
  // Client to server
  SUBSCRIBE_ROOM = 'subscribe:room',
  UNSUBSCRIBE_ROOM = 'unsubscribe:room',
  SUBSCRIBE_DATE = 'subscribe:date',
  UNSUBSCRIBE_DATE = 'unsubscribe:date',

  // Server to client
  SLOT_BOOKED = 'slot:booked',
  SLOT_CANCELLED = 'slot:cancelled',
  ROOM_UPDATED = 'room:updated',
  BOOKING_CREATED = 'booking:created',
  BOOKING_CANCELLED = 'booking:cancelled',
}

export interface SlotBookedPayload {
  roomId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}

export interface SlotCancelledPayload {
  roomId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface RoomUpdatedPayload {
  roomId: string;
  changes: any;
}

export interface BookingCreatedPayload {
  bookingId: string;
  roomId: string;
  userId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
}

export interface BookingCancelledPayload {
  bookingId: string;
  roomId: string;
  slotId: string;
  date: string;
}
