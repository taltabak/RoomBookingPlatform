import prisma from '../../config/database';
import { Booking, BookingStatus } from '@prisma/client';

export class BookingsRepository {
  async findById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            location: true,
            capacity: true,
          },
        },
        slots: true,
      },
    });
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true,
            capacity: true,
          },
        },
        slots: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByRoomId(
    roomId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Booking[]> {
    const where: any = { roomId, status: BookingStatus.CONFIRMED };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        slots: true,
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async createBookingWithTransaction(
    bookingData: {
      userId: string;
      roomId: string;
      slotId: string;
      date: Date;
      startTime: string;
      endTime: string;
    }
  ): Promise<Booking> {
    return prisma.$transaction(
      async (tx) => {
        // 1. Check user permissions
        const user = await tx.user.findUnique({
          where: { id: bookingData.userId },
        });

        if (!user) {
          throw new Error('User not found');
        }

        // 2. Calculate booking duration
        const [startHour, startMin] = bookingData.startTime.split(':').map(Number);
        const [endHour, endMin] = bookingData.endTime.split(':').map(Number);
        const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        if (durationMinutes > user.maxBookingDuration) {
          throw new Error(
            `Booking duration exceeds your limit of ${user.maxBookingDuration} minutes`
          );
        }

        // 3. Check if user has concurrent bookings (if not allowed)
        if (!user.canBookMultipleRooms) {
          const conflictingBooking = await tx.booking.findFirst({
            where: {
              userId: bookingData.userId,
              date: bookingData.date,
              status: BookingStatus.CONFIRMED,
              OR: [
                {
                  AND: [
                    { startTime: { lte: bookingData.startTime } },
                    { endTime: { gt: bookingData.startTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { lt: bookingData.endTime } },
                    { endTime: { gte: bookingData.endTime } },
                  ],
                },
                {
                  AND: [
                    { startTime: { gte: bookingData.startTime } },
                    { endTime: { lte: bookingData.endTime } },
                  ],
                },
              ],
            },
          });

          if (conflictingBooking) {
            throw new Error('You already have a booking at this time');
          }
        }

        // 4. Find and lock slots
        const slot = await tx.slot.findUnique({
          where: {
            id: bookingData.slotId,
          },
        });

        if (!slot) {
          throw new Error('No available slots found for this time range');
        }

        // 5. Check if any slot is already booked
        const bookedSlot = slot.isBooked;
        if (bookedSlot) {
          throw new Error('One or more time slots are already booked');
        }

        // 6. Create booking
        const booking = await tx.booking.create({
          data: {
            userId: bookingData.userId,
            roomId: bookingData.roomId,
            date: bookingData.date,
            startTime: bookingData.startTime,
            endTime: bookingData.endTime,
            status: BookingStatus.CONFIRMED,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
                location: true,
                capacity: true,
              },
            },
          },
        });

        // 7. Update slots as booked
        await tx.slot.updateMany({
          where: {
            id: slot.id,
          },
          data: {
            isBooked: true,
            bookingId: booking.id,
            version: { increment: 1 },
          },
        });

        // 8. Fetch updated slots
        const updatedSlots = await tx.slot.findMany({
          where: {
            bookingId: booking.id,
          },
        });

        return { ...booking, slots: updatedSlots };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000, // 10 seconds
      }
    );
  }

  async cancelBooking(id: string): Promise<Booking> {
    return prisma.$transaction(async (tx) => {
      // 1. Update booking status
      const booking = await tx.booking.update({
        where: { id },
        data: { status: BookingStatus.CANCELLED },
        include: {
          room: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // 2. Release slots
      await tx.slot.updateMany({
        where: { bookingId: id },
        data: {
          isBooked: false,
          bookingId: null,
          version: { increment: 1 },
        },
      });

      return booking;
    });
  }
}
