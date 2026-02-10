import { Router } from 'express';
import { SlotsController } from './slots.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { isRoomOwnerOrAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  generateSlotsSchema,
  getSlotsSchema,
  getAvailableSlotsSchema,
} from './slots.dto';

const router = Router();
const controller = new SlotsController();

// Public route
router.get('/available', validate(getAvailableSlotsSchema), controller.getAvailable);

// Protected routes
router.use(authenticate);

router.post(
  '/room/:roomId',
  isRoomOwnerOrAdmin,
  validate(generateSlotsSchema),
  controller.generate
);

router.get('/room/:roomId', validate(getSlotsSchema), controller.getByRoom);

export default router;
