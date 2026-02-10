import { BookingsRepository } from './bookings.repository';
import { GetRoomBookingsDto,CreateBookingWithSlotDto } from './bookings.dto';
import { AppError } from '../../middleware/errorHandler.middleware';
import { RoomsRepository } from '../rooms/rooms.repository';
import { CacheService } from '../../utils/cache.utils';
import { UserRole } from '@prisma/client';

export class BookingsService {
  private repository: BookingsRepository;
  private roomsRepository: RoomsRepository;

  constructor() {
    this.repository = new BookingsRepository();
    this.roomsRepository = new RoomsRepository();
  }

  async createBooking(data: CreateBookingWithSlotDto, userId: string) {
    // Verify room exists
    const room = await this.roomsRepository.findById(data.roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (!room.isActive) {
      throw new AppError('Room is not active', 400);
    }

    // Validate time range
    if (data.startTime >= data.endTime) {
      throw new AppError('Start time must be before end time', 400);
    }

    const dateObj = new Date(data.date);

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      throw new AppError('Cannot book for a past date', 400);
    }

    try {
      // Create booking with transaction (handles race conditions)
      const booking = await this.repository.createBookingWithTransaction({
        userId,
        roomId: data.roomId,
        slotId: data.slotId,
        date: dateObj,
        startTime: data.startTime,
        endTime: data.endTime,
      });

      // Invalidate cache
      await CacheService.invalidateRoomAvailability(data.roomId, data.date);

      return booking;
    } catch (error: any) {
      // Handle specific errors
      if (error.message.includes('already have a booking')) {
        throw new AppError(error.message, 409);
      }
      if (error.message.includes('already booked')) {
        throw new AppError(error.message, 409);
      }
      if (error.message.includes('duration exceeds')) {
        throw new AppError(error.message, 403);
      }
      if (error.message.includes('No available slots')) {
        throw new AppError(error.message, 404);
      }
      throw error;
    }
  }

  async getBookingById(id: string, userId: string, userRole: UserRole) {
    const booking = await this.repository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    // Get room details to check ownership
    const room = await this.roomsRepository.findById(booking.roomId);
    if (!room) {
      throw new AppError('Associated room not found', 404);
    }

    // Users can only view their own bookings (unless admin or room owner)
    if (
      booking.userId !== userId &&
      userRole !== UserRole.ADMIN &&
      room.ownerId !== userId
    ) {
      throw new AppError('Forbidden: Cannot view this booking', 403);
    }

    return booking;
  }

  async getUserBookings(userId: string) {
    return this.repository.findByUserId(userId);
  }

  async getRoomBookings(
    roomId: string,
    filters: GetRoomBookingsDto,
    userId: string,
    userRole: UserRole
  ) {
    // Verify room exists
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    // Only room owner or admin can view room bookings
    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: Cannot view bookings for this room', 403);
    }

    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    return this.repository.findByRoomId(roomId, startDate, endDate);
  }

  async cancelBooking(id: string, userId: string, userRole: UserRole) {
    const booking = await this.repository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400);
    }

    // Users can only cancel their own bookings (unless admin)
    if (booking.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: Cannot cancel this booking', 403);
    }

    // Check if booking is in the past
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new AppError('Cannot cancel past bookings', 400);
    }

    const cancelledBooking = await this.repository.cancelBooking(id);

    // Invalidate cache
    const dateStr = booking.date.toISOString().split('T')[0];
    await CacheService.invalidateRoomAvailability(booking.roomId, dateStr);

    return cancelledBooking;
  }
}
