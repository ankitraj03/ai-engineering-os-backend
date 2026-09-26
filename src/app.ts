import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { envConfig } from './config/env.config';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import routes from './routes';
import { NotFoundError } from './utils/app-error';

export function createApp(): Application {
  const app: Application = express();

  // Security Headers
  app.use(helmet());

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: envConfig.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
  );

  // Request Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request Logging
  if (envConfig.nodeEnv !== 'test') {
    app.use(requestLogger);
  }

  // Mount API Routes (accessible both at root and /api for full frontend parity)
  app.use('/api', routes);
  app.use('/', routes);

  // 404 Handler for Unmatched Routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
