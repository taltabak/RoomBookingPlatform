import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt.utils';
import logger from '../utils/logger';

export class WebSocketServer {
  private io: Server;

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      path: '/socket.io',
    });

    this.setupMiddleware();
    this.setupConnectionHandler();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyAccessToken(token);
        socket.data.userId = decoded.userId;
        socket.data.userRole = decoded.role;

        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupConnectionHandler() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      logger.info(`WebSocket client connected: ${socket.id}, userId: ${userId}`);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle room subscription
      socket.on('subscribe:room', (data: { roomId: string }) => {
        const { roomId } = data;
        socket.join(`room:${roomId}`);
        logger.info(`User ${userId} subscribed to room ${roomId}`);
      });

      socket.on('unsubscribe:room', (data: { roomId: string }) => {
        const { roomId } = data;
        socket.leave(`room:${roomId}`);
        logger.info(`User ${userId} unsubscribed from room ${roomId}`);
      });

      // Handle date subscription
      socket.on('subscribe:date', (data: { date: string }) => {
        const { date } = data;
        socket.join(`date:${date}`);
        logger.info(`User ${userId} subscribed to date ${date}`);
      });

      socket.on('unsubscribe:date', (data: { date: string }) => {
        const { date } = data;
        socket.leave(`date:${date}`);
        logger.info(`User ${userId} unsubscribed from date ${date}`);
      });

      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
      });
    });
  }

  // Emit events to specific rooms
  emitSlotBooked(roomId: string, date: string, payload: any) {
    this.io.to(`room:${roomId}`).emit('slot:booked', payload);
    this.io.to(`date:${date}`).emit('slot:booked', payload);
  }

  emitSlotCancelled(roomId: string, date: string, payload: any) {
    this.io.to(`room:${roomId}`).emit('slot:cancelled', payload);
    this.io.to(`date:${date}`).emit('slot:cancelled', payload);
  }

  emitRoomUpdated(roomId: string, payload: any) {
    this.io.to(`room:${roomId}`).emit('room:updated', payload);
  }

  emitBookingCreated(roomId: string, userId: string, payload: any) {
    this.io.to(`room:${roomId}`).emit('booking:created', payload);
    this.io.to(`user:${userId}`).emit('booking:created', payload);
  }

  emitBookingCancelled(roomId: string, userId: string, payload: any) {
    this.io.to(`room:${roomId}`).emit('booking:cancelled', payload);
    this.io.to(`user:${userId}`).emit('booking:cancelled', payload);
  }

  // Get the Socket.IO server instance
  getIO() {
    return this.io;
  }

  close() {
    this.io.close(() => {
      logger.info('WebSocket server closed');
    });
  }
}

// Export singleton instance
let websocketServer: WebSocketServer | null = null;

export const initializeWebSocket = (httpServer: HTTPServer): WebSocketServer => {
  websocketServer = new WebSocketServer(httpServer);
  return websocketServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!websocketServer) {
    throw new Error('WebSocket server not initialized');
  }
  return websocketServer;
};
