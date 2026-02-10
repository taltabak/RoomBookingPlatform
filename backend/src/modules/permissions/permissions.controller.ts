import { Request, Response, NextFunction } from 'express';
import { PermissionsService } from './permissions.service';

export class PermissionsController {
  private service: PermissionsService;

  constructor() {
    this.service = new PermissionsService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const userId = req.user!.id;
      const request = await this.service.createPermissionRequest(data, userId);
      res.status(201).json({ request });
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requests = await this.service.getAllPermissionRequests();
      res.json({ requests });
    } catch (error) {
      next(error);
    }
  };

  getPending = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requests = await this.service.getPendingPermissionRequests();
      res.json({ requests });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const request = await this.service.getPermissionRequestById(id);
      res.json({ request });
    } catch (error) {
      next(error);
    }
  };

  getMyRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const requests = await this.service.getUserPermissionRequests(userId);
      res.json({ requests });
    } catch (error) {
      next(error);
    }
  };

  review = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body;
      const reviewerId = req.user!.id;
      const result = await this.service.reviewPermissionRequest(id, data, reviewerId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
