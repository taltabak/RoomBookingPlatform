import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { AdminController } from './admin.controller';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticate);
// router.use(requireRole('ADMIN'));

// Get pending users
router.get('/pending-users', adminController.getPendingUsers);

// Update user status
router.patch('/users/:userId/status', adminController.updateUserStatus);

export default router;
