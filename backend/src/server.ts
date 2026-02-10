import http from 'http';
import { createApp } from './app';
import { SERVER_CONFIG } from './config';
import { initializeWebSocket } from './websocket/websocket.server';
import prisma from './config/database';
import redis from './config/redis';
import logger from './utils/logger';

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    logger.info('✅ Redis connected');

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize WebSocket server
    const websocketServer = initializeWebSocket(httpServer);
    logger.info('✅ WebSocket server initialized');

    // Start server
    httpServer.listen(SERVER_CONFIG.port, () => {
      logger.info(`🚀 Server running on port ${SERVER_CONFIG.port}`);
      logger.info(`📝 Environment: ${SERVER_CONFIG.nodeEnv}`);
      logger.info(`🌐 CORS origin: ${SERVER_CONFIG.corsOrigin}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      // Close WebSocket server
      websocketServer.close();
      logger.info('WebSocket server closed');

      httpServer.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        logger.info('Database disconnected');

        await redis.quit();
        logger.info('Redis disconnected');

        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
