import prisma from '../../config/database';
import { Room, Prisma } from '@prisma/client';

export interface RoomSearchFilters {
  name?: string;
  location?: string;
  capacity?: number;
  maxPrice?: number;
  amenities?: string[];
  isActive?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export class RoomsRepository {
  async findAll(filters?: RoomSearchFilters): Promise<Room[]> {
    const where: any = {
      isActive: filters?.isActive !== undefined ? filters.isActive : true,
    };

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters?.capacity) {
      where.capacity = {
        gte: filters.capacity,
      };
    }

    if (filters?.maxPrice) {
      where.price = {
        lte: filters.maxPrice,
      };
    }

    return prisma.room.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(
    filters?: RoomSearchFilters,
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<Room>> {
    const where: any = {
      isActive: filters?.isActive !== undefined ? filters.isActive : true,
    };

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive',
      };
    }

    if (filters?.capacity) {
      where.capacity = {
        gte: filters.capacity,
      };
    }

    if (filters?.maxPrice) {
      where.price = {
        lte: filters.maxPrice,
      };
    }

    const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
    const take = pagination?.limit || 10;

    // Build orderBy object
    const orderBy: any = {};
    if (pagination?.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy,
      }),
      prisma.room.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<Room | null> {
    return prisma.room.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async create(data: any): Promise<Room> {
    return prisma.room.create({
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async createSlots(slots: any[]): Promise<void> {
    await prisma.slot.createMany({
      data: slots,
      skipDuplicates: true,
    });
  }

  async update(id: string, data: Prisma.RoomUpdateInput): Promise<Room> {
    return prisma.room.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.room.delete({
      where: { id },
    });
  }

  async findByOwnerId(ownerId: string): Promise<Room[]> {
    return prisma.room.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
