import { app } from './app';
import { envConfig } from './config/env.config';
import { initializeDatabase, closeDatabase } from './db/data-source';
import { maskDatabaseUrl } from './config/database.config';
import { logger } from './utils/logger';

/**
 * Validate required environment variables during startup.
 * Halts startup immediately if mandatory variables are missing.
 */
function validateEnvironment(): void {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === '') {
    logger.error('================================================================');
    logger.error('DATABASE_URL is not configured');
    logger.error('Please configure DATABASE_URL in .env before starting the server.');
    logger.error('================================================================');
    process.exit(1);
  }

  if (!process.env.PORT && !envConfig.port) {
    logger.warn('PORT not explicitly configured; using default port 4000.');
  }

  if (!process.env.CORS_ORIGIN && !envConfig.corsOrigin) {
    logger.warn('CORS_ORIGIN not explicitly configured; using default http://localhost:3000.');
  }
}

async function startServer() {
  logger.log('🚀 Starting AI Engineering OS Backend...');

  // 1. Validate required environment variables
  validateEnvironment();

  // 2. Initialize TypeORM DataSource and connect to PostgreSQL
  try {
    await initializeDatabase();
  } catch (error: unknown) {
    const err = error as Error;
    const sanitizedError = maskDatabaseUrl(err.message);
    logger.error('================================================================');
    logger.error(`Database connection failed: ${sanitizedError}`);
    logger.error('Server startup halted due to database connection failure.');
    logger.error('================================================================');
    process.exit(1);
  }

  // 3. Start HTTP server only after database is connected
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

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    logger.log(`\nReceived ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      logger.log('Closed out remaining HTTP connections.');

      try {
        await closeDatabase();
      } catch (err: unknown) {
        const error = err as Error;
        logger.error(`Error closing database connection: ${maskDatabaseUrl(error.message)}`);
      }

      process.exit(0);
    });

    // Force shutdown after 10s if connections do not drain
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
  logger.error(`Fatal startup error: ${maskDatabaseUrl(error.message)}`, error.stack);
  process.exit(1);
});
