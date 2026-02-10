import prisma from '../../config/database';
import { User, RegistrationStatus } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

export class UsersRepository {
  async findAll(): Promise<UserWithoutPassword[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        registrationStatus: true,
        canBookMultipleRooms: true,
        maxBookingDuration: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        registrationStatus: true,
        canBookMultipleRooms: true,
        maxBookingDuration: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        registrationStatus: true,
        canBookMultipleRooms: true,
        maxBookingDuration: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async findPendingRoomOwners(): Promise<UserWithoutPassword[]> {
    return prisma.user.findMany({
      where: {
        role: 'ROOM_OWNER',
        registrationStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        registrationStatus: true,
        canBookMultipleRooms: true,
        maxBookingDuration: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async updateRegistrationStatus(
    id: string,
    status: RegistrationStatus
  ): Promise<UserWithoutPassword> {
    return prisma.user.update({
      where: { id },
      data: { registrationStatus: status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        registrationStatus: true,
        canBookMultipleRooms: true,
        maxBookingDuration: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }
}
