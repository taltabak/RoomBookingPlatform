import { RoomsRepository, RoomSearchFilters, PaginationOptions } from './rooms.repository';
import { CreateRoomDto, UpdateRoomDto, SearchRoomsDto, PaginatedResponse, PaginationMeta } from './rooms.dto';
import { AppError } from '../../middleware/errorHandler.middleware';
import { CacheService } from '../../utils/cache.utils';
import { UserRole } from '@prisma/client';
import { SlotsService } from '../slots/slots.service';

export class RoomsService {
  private repository: RoomsRepository;
  private slotsService: SlotsService;

  constructor() {
    this.repository = new RoomsRepository();
    this.slotsService = new SlotsService();
  }

  async searchRooms(filters: SearchRoomsDto): Promise<PaginatedResponse<any>> {
    const searchFilters: RoomSearchFilters = {};
    
    // Ensure pagination parameters are integers
    const page = typeof filters.page === 'string' ? parseInt(filters.page, 10) : filters.page || 1;
    const limit = typeof filters.limit === 'string' ? parseInt(filters.limit, 10) : filters.limit || 10;
    
    const pagination: PaginationOptions = {
      page: Math.max(1, page), // Ensure page is at least 1
      limit: Math.min(Math.max(1, limit), 100), // Ensure limit is between 1-100
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
    };

    // Build search filters
    if (filters.name) {
      searchFilters.name = filters.name;
    }

    if (filters.location) {
      searchFilters.location = filters.location;
    }

    if (filters.capacity) {
      searchFilters.capacity = parseInt(filters.capacity, 10);
    }

    if (filters.maxPrice) {
      searchFilters.maxPrice = parseFloat(filters.maxPrice);
    }

    if (filters.amenities) {
      searchFilters.amenities = filters.amenities.split(',');
    }

    // Get paginated results
    const result = await this.repository.findAllPaginated(searchFilters, pagination);
    let rooms = result.data;

    // Filter by amenities if provided (JSON field filtering)
    if (searchFilters.amenities && searchFilters.amenities.length > 0) {
      rooms = rooms.filter((room) => {
        const roomAmenities = room.amenities as string[];
        return searchFilters.amenities!.every((amenity) =>
          roomAmenities.includes(amenity)
        );
      });
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / pagination.limit);
    const paginationMeta: PaginationMeta = {
      currentPage: pagination.page,
      totalPages,
      totalItems: result.total,
      itemsPerPage: pagination.limit,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    };

    return {
      data: rooms,
      pagination: paginationMeta,
    };
  }

  async getRoomById(id: string) {
    // Check cache first
    const cached = await CacheService.getRoom(id);
    if (cached) {
      return cached;
    }

    const room = await this.repository.findById(id);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    // Cache the room
    await CacheService.cacheRoom(id, room);

    return room;
  }

  async createRoom(data: CreateRoomDto, ownerId: string) {
    const room = await this.repository.create({
      ...data,
      ownerId,
    });

    // Generate slots for the next 30 days using SlotsService
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30);

    // Use the SlotsService to generate slots instead of doing it manually
    await this.slotsService.generateSlots(
      room.id,
      {
        startDate: today.toISOString().split('T')[0], // YYYY-MM-DD format
        endDate: endDate.toISOString().split('T')[0],  // YYYY-MM-DD format
        slotDuration: 60, // 60 minutes per slot
        startTime: '09:00', // Start at 9 AM
        endTime: '18:00',   // End at 6 PM
      },
      ownerId,
      UserRole.ADMIN // Pass admin role to bypass permission check since this is internal
    );

    return room;
  }

  async updateRoom(
    id: string,
    data: UpdateRoomDto,
    userId: string,
    userRole: UserRole
  ) {
    const room = await this.repository.findById(id);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    // Only the owner or admin can update the room
    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: You can only update your own rooms', 403);
    }

    const updatedRoom = await this.repository.update(id, data);

    // Invalidate cache
    await CacheService.invalidateRoom(id);

    return updatedRoom;
  }

  async deleteRoom(id: string, userId: string, userRole: UserRole) {
    const room = await this.repository.findById(id);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    // Only the owner or admin can delete the room
    if (room.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new AppError('Forbidden: You can only delete your own rooms', 403);
    }

    // Delete all slots for this room first
    await this.slotsService.deleteAllSlotsForRoom(id, userId, userRole);

    // Then delete the room
    await this.repository.delete(id);

    // Invalidate cache
    await CacheService.invalidateRoom(id);
    await CacheService.invalidateAllRoomAvailability(id);

    return { message: 'Room and all associated slots deleted successfully' };
  }

  async getRoomsByOwner(ownerId: string) {
    return this.repository.findByOwnerId(ownerId);
  }
}
