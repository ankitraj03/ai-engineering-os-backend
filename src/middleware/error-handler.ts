import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode >= 500) {
    logger.error(`[UnhandledError] ${err.message}`, err.stack);
  } else {
    logger.warn(`[ClientError] [${statusCode}] ${err.message}`);
  }

  res.status(statusCode).json({
    statusCode,
    message,
    error: isAppError ? err.name : 'Internal Server Error',
    ...(isAppError && err.details ? { details: err.details } : {}),
    timestamp: new Date().toISOString(),
  });
}
