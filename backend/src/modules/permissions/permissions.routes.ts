import { Router } from 'express';
import { PermissionsController } from './permissions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createPermissionRequestSchema,
  reviewPermissionRequestSchema,
  getPermissionRequestSchema,
} from './permissions.dto';

const router = Router();
const controller = new PermissionsController();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createPermissionRequestSchema), controller.create);
router.get('/my-requests', controller.getMyRequests);

// Admin only routes
router.get('/', isAdmin, controller.getAll);
router.get('/pending', isAdmin, controller.getPending);
router.get('/:id', isAdmin, validate(getPermissionRequestSchema), controller.getById);
router.patch(
  '/:id/review',
  isAdmin,
  validate(reviewPermissionRequestSchema),
  controller.review
);

export default router;
