import { app } from './app';
import { envConfig } from './config/env.config';
import { postgresManager } from './db/postgres';
import { logger } from './utils/logger';

async function startServer() {
  const port = envConfig.port;

  const server = app.listen(port, () => {
    logger.log('================================================================');
    logger.log(`🚀 AI Engineering OS Express Backend is running!`);
    logger.log(`📍 Server URL:        http://localhost:${port}`);
    logger.log(`🏥 Health Check:      http://localhost:${port}/health`);
    logger.log(`🗄️ Database Health:   http://localhost:${port}/health/db`);
    logger.log(`🌐 CORS Origin:       ${envConfig.corsOrigin}`);
    logger.log(`⚙️ Environment:       ${envConfig.nodeEnv}`);
    logger.log('================================================================');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`\nReceived ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.log('Closed out remaining HTTP connections.');

      try {
        await postgresManager.close();
        logger.log('PostgreSQL database pool closed cleanly.');
      } catch (err: unknown) {
        const error = err as Error;
        logger.error(`Error closing database pool: ${error.message}`);
      }

      process.exit(0);
    });

    // Force shutdown after 10s if connections don't drain
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err: unknown) => {
  const error = err as Error;
  logger.error(`Fatal startup error: ${error.message}`, error.stack);
  process.exit(1);
});
