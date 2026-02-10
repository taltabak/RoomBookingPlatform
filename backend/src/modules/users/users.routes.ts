import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import { updateUserSchema, approveUserSchema, getUserSchema } from './users.dto';

const router = Router();
const controller = new UsersController();

// All routes require authentication
router.use(authenticate);

router.get('/', isAdmin, controller.getAll);
router.get('/pending', isAdmin, controller.getPending);
router.get('/:id', validate(getUserSchema), controller.getById);
router.patch('/:id', validate(updateUserSchema), controller.update);
router.delete('/:id', isAdmin, controller.delete);
router.patch('/:id/approve', isAdmin, validate(approveUserSchema), controller.approve);

export default router;
