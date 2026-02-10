import { SlotsRepository } from './slots.repository';
import { GenerateSlotsDto, GetAvailableSlotsDto } from './slots.dto';
import { AppError } from '../../middleware/errorHandler.middleware';
import { RoomsRepository } from '../rooms/rooms.repository';
import { CacheService } from '../../utils/cache.utils';
import { UserRole } from '@prisma/client';

export class SlotsService {
  private repository: SlotsRepository;
  private roomsRepository: RoomsRepository;

  constructor() {
    this.repository = new SlotsRepository();
    this.roomsRepository = new RoomsRepository();
  }

  async generateSlots(
    roomId: string,
    data: GenerateSlotsDto,
    userId: string,
    userRole: UserRole
  ) {
    // Verify room exists and user has permission
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: You can only generate slots for your own rooms', 403);
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate > endDate) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Generate slots
    const slots: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const timeSlots = this.generateTimeSlotsForDay(
        data.startTime,
        data.endTime,
        data.slotDuration
      );

      for (const { start, end } of timeSlots) {
        slots.push({
          roomId,
          date: new Date(dateStr),
          startTime: start,
          endTime: end,
          isBooked: false,
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Create slots (skip duplicates)
    const count = await this.repository.createMany(slots);

    // Invalidate cache
    await CacheService.invalidateAllRoomAvailability(roomId);

    return {
      message: `Generated ${count} time slots`,
      count,
    };
  }

  private generateTimeSlotsForDay(
    startTime: string,
    endTime: string,
    duration: number
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
      const nextMinutes = currentMinutes + duration;
      
      const startH = Math.floor(currentMinutes / 60);
      const startM = currentMinutes % 60;
      const endH = Math.floor(nextMinutes / 60);
      const endM = nextMinutes % 60;

      slots.push({
        start: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
        end: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
      });

      currentMinutes = nextMinutes;
    }

    return slots;
  }

  async getSlotsByRoomAndDate(roomId: string, date: string) {
    const dateObj = new Date(date);
    
    // Check cache
    const cached = await CacheService.getRoomAvailability(roomId, date);
    if (cached) {
      return cached;
    }

    const slots = await this.repository.findByRoomAndDate(roomId, dateObj);

    // Cache the result
    await CacheService.cacheRoomAvailability(roomId, date, slots);

    return slots;
  }

  async getAvailableSlots(filters: GetAvailableSlotsDto) {
    const dateObj = new Date(filters.date);

    return this.repository.findAvailable({
      roomId: filters.roomId,
      date: dateObj,
      startTime: filters.startTime,
      endTime: filters.endTime,
    });
  }

  async deleteSlots(
    roomId: string,
    startDate: string,
    endDate: string,
    userId: string,
    userRole: UserRole
  ) {
    // Verify room exists and user has permission
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: You can only delete slots for your own rooms', 403);
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    await this.repository.deleteByRoomAndDateRange(roomId, startDateObj, endDateObj);

    // Invalidate cache
    await CacheService.invalidateAllRoomAvailability(roomId);

    return { message: 'Slots deleted successfully' };
  }

  async deleteAllSlotsForRoom(roomId: string, userId: string, userRole: UserRole) {
    // Verify room exists and user has permission
    const room = await this.roomsRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: You can only delete slots for your own rooms', 403);
    }

    // Delete all slots for this room (including booked ones)
    await this.repository.deleteAllByRoomId(roomId);

    // Invalidate cache
    await CacheService.invalidateAllRoomAvailability(roomId);

    return { message: 'All slots for room deleted successfully' };
  }
}
