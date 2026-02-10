import prisma from '../../config/database';
import { PermissionRequest, RegistrationStatus } from '@prisma/client';

export class PermissionsRepository {
  async findAll(): Promise<PermissionRequest[]> {
    return prisma.permissionRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        reviewedBy: {
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

  async findPending(): Promise<PermissionRequest[]> {
    return prisma.permissionRequest.findMany({
      where: {
        status: RegistrationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findById(id: string): Promise<PermissionRequest | null> {
    return prisma.permissionRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        reviewedBy: {
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

  async findByUserId(userId: string): Promise<PermissionRequest[]> {
    return prisma.permissionRequest.findMany({
      where: { userId },
      include: {
        reviewedBy: {
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

  async create(data: {
    userId: string;
    requestType: string;
    reason: string;
    requestedValue?: number;
  }): Promise<PermissionRequest> {
    return prisma.permissionRequest.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async reviewRequest(
    id: string,
    reviewerId: string,
    approve: boolean,
    reviewNotes?: string
  ): Promise<PermissionRequest> {
    return prisma.$transaction(async (tx) => {
      // Update the permission request
      const request = await tx.permissionRequest.update({
        where: { id },
        data: {
          status: approve ? RegistrationStatus.APPROVED : RegistrationStatus.REJECTED,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          reviewNotes,
        },
        include: {
          user: true,
          reviewedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // If approved, update user permissions
      if (approve) {
        if (request.requestType === 'MULTIPLE_ROOMS') {
          await tx.user.update({
            where: { id: request.userId },
            data: { canBookMultipleRooms: true },
          });
        } else if (request.requestType === 'EXTENDED_DURATION' && request.requestedValue) {
          await tx.user.update({
            where: { id: request.userId },
            data: { maxBookingDuration: request.requestedValue },
          });
        }
      }

      return request;
    });
  }
}
