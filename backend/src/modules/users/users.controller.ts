import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  private service: UsersService;

  constructor() {
    this.service = new UsersService();
  }

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getAllUsers();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.service.getUserById(id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const requestingUserId = req.user!.id;
      const user = await this.service.updateUser(id, data, requestingUserId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.service.deleteUser(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getPending = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.service.getPendingRoomOwners();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const result = await this.service.approveUser(id, data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
