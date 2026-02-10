import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};

export const isAdmin = authorize(UserRole.ADMIN);
export const isRoomOwnerOrAdmin = authorize(UserRole.ROOM_OWNER, UserRole.ADMIN);
export const isUser = authorize(UserRole.USER, UserRole.ROOM_OWNER, UserRole.ADMIN);
