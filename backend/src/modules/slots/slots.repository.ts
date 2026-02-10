import prisma from '../../config/database';
import { Slot } from '@prisma/client';

export class SlotsRepository {
  async findByRoomAndDate(roomId: string, date: Date): Promise<Slot[]> {
    return prisma.slot.findMany({
      where: {
        roomId,
        date,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findAvailable(filters: {
    roomId?: string;
    date: Date;
    startTime?: string;
    endTime?: string;
  }): Promise<Slot[]> {
    const where: any = {
      date: filters.date,
      isBooked: false,
    };

    if (filters.roomId) {
      where.roomId = filters.roomId;
    }

    if (filters.startTime) {
      where.startTime = { gte: filters.startTime };
    }

    if (filters.endTime) {
      where.endTime = { lte: filters.endTime };
    }

    return prisma.slot.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true,
            capacity: true,
            amenities: true,
            price: true,
          },
        },
      },
      orderBy: [
        { roomId: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createMany(slots: any[]): Promise<number> {
    const result = await prisma.slot.createMany({
      data: slots,
      skipDuplicates: true,
    });
    return result.count;
  }

  async findConflictingSlots(
    roomId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<Slot[]> {
    return prisma.slot.findMany({
      where: {
        roomId,
        date,
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } },
            ],
          },
        ],
      },
    });
  }

  async findSlotsForBooking(
    roomId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<Slot[]> {
    return prisma.slot.findMany({
      where: {
        roomId,
        date,
        startTime: { gte: startTime },
        endTime: { lte: endTime },
        isBooked: false,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async deleteByRoomAndDateRange(
    roomId: string,
    startDate: Date,
    endDate: Date
  ): Promise<void> {
    await prisma.slot.deleteMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        isBooked: false, // Don't delete booked slots
      },
    });
  }

  async deleteAllByRoomId(roomId: string): Promise<void> {
    await prisma.slot.deleteMany({
      where: {
        roomId,
      },
    });
  }
}
