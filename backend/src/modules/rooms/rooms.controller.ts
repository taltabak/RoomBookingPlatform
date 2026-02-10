import { Request, Response, NextFunction } from 'express';
import { RoomsService } from './rooms.service';

export class RoomsController {
  private service: RoomsService;

  constructor() {
    this.service = new RoomsService();
  }

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as any;
      const rooms = await this.service.searchRooms(filters);
      res.json( rooms);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const room = await this.service.getRoomById(id);
      res.json({ room });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const ownerId = req.user!.id;
      const room = await this.service.createRoom(data, ownerId);
      res.status(201).json({ room });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const room = await this.service.updateRoom(id, data, userId, userRole);
      res.json({ room });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await this.service.deleteRoom(id, userId, userRole);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getMyRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ownerId = req.user!.id;
      const rooms = await this.service.getRoomsByOwner(ownerId);
      res.json({ rooms });
    } catch (error) {
      next(error);
    }
  };
}
