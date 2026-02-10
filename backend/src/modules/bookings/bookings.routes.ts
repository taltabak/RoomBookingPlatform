import { Router } from 'express';
import { BookingsController } from './bookings.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createBookingSchema,
  getBookingSchema,
  getRoomBookingsSchema,
} from './bookings.dto';

const router = Router();
const controller = new BookingsController();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createBookingSchema), controller.create);
router.get('/', controller.getMyBookings);
router.get('/:id', validate(getBookingSchema), controller.getById);
router.delete('/:id', controller.cancel);
router.get('/room/:roomId', validate(getRoomBookingsSchema), controller.getRoomBookings);

export default router;
