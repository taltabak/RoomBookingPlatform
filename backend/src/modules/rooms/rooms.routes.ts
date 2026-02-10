import { Router } from 'express';
import { RoomsController } from './rooms.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { isRoomOwnerOrAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createRoomSchema,
  updateRoomSchema,
  getRoomSchema,
  searchRoomsSchema,
} from './rooms.dto';

const router = Router();
const controller = new RoomsController();

// Public routes
router.get('/', validate(searchRoomsSchema), controller.search);
router.get('/:id', validate(getRoomSchema), controller.getById);

// Protected routes
router.use(authenticate);

router.post('/', isRoomOwnerOrAdmin, validate(createRoomSchema), controller.create);
router.patch('/:id', isRoomOwnerOrAdmin, validate(updateRoomSchema), controller.update);
router.delete('/:id', isRoomOwnerOrAdmin, controller.delete);
router.get('/owner/me', isRoomOwnerOrAdmin, controller.getMyRooms);

export default router;
