import express, { Express } from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import usersRoutes from './modules/users/users.routes';
import roomsRoutes from './modules/rooms/rooms.routes';
import slotsRoutes from './modules/slots/slots.routes';
import bookingsRoutes from './modules/bookings/bookings.routes';
import permissionsRoutes from './modules/permissions/permissions.routes';
import adminRoutes from './modules/admin/admin.routes';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors({
    origin: SERVER_CONFIG.corsOrigin,
    credentials: true,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));


  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: SERVER_CONFIG.nodeEnv,
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/rooms', roomsRoutes);
  app.use('/api/slots', slotsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/permissions', permissionsRoutes);
  app.use('/api/admin', adminRoutes);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
