import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminController {
  async getPendingUsers(_req: Request, res: Response) {
    try {
      const pendingUsers = await prisma.user.findMany({
        where: {
          registrationStatus: 'PENDING'
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      res.json(pendingUsers);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ message: 'Failed to fetch pending users' });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          registrationStatus: status
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          registrationStatus: true
        }
      });

      return res.json({
        message: `User ${status.toLowerCase()} successfully`,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ message: 'Failed to update user status' });
    }
  }
}
