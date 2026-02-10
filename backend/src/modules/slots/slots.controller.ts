import { Request, Response, NextFunction } from 'express';
import { SlotsService } from './slots.service';

export class SlotsController {
  private service: SlotsService;

  constructor() {
    this.service = new SlotsService();
  }

  generate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roomId } = req.params;
      const data = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const result = await this.service.generateSlots(roomId, data, userId, userRole);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  getByRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roomId } = req.params;
      const { date } = req.query as { date: string };
      const slots = await this.service.getSlotsByRoomAndDate(roomId, date);
      res.json({ slots });
    } catch (error) {
      next(error);
    }
  };

  getAvailable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = req.query as { date: string; roomId?: string; startTime?: string; endTime?: string };
      const slots = await this.service.getAvailableSlots(filters);
      res.json({ slots });
    } catch (error) {
      next(error);
    }
  };
}
