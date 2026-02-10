export enum UserRole {
  USER = 'USER',
  ROOM_OWNER = 'ROOM_OWNER',
  ADMIN = 'ADMIN',
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  registrationStatus: RegistrationStatus;
  canBookMultipleRooms: boolean;
  maxBookingDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  location: string;
  amenities: string[];
  price?: number;
  imageUrl?: string;
  ownerId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  roomId: string;
  room?: Room;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  roomId: string;
  room?: Room;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  slots?: Slot[];
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRequest {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  requestType: 'MULTIPLE_ROOMS' | 'EXTENDED_DURATION';
  reason: string;
  requestedValue?: number;
  status: RegistrationStatus;
  reviewedById?: string;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: string;
  details?: any[];
}
