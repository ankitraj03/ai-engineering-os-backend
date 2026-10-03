import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from './app-error';

export interface DatabaseErrorDetails {
  code?: string;
  message?: string;
  detail?: string;
  details?: string;
  table?: string;
  constraint?: string;
}

export function handleDatabaseError(
  error: DatabaseErrorDetails | Error | null | unknown,
  entityName = 'Resource'
): never {
  if (!error) {
    throw new InternalServerError('An unknown database error occurred');
  }

  if (error instanceof AppError) {
    throw error;
  }

  const pgError = error as DatabaseErrorDetails;
  const detail = pgError.detail || pgError.details || pgError.message || '';

  // PostgreSQL standard error codes (Class 23 - Integrity Constraint Violation)
  switch (pgError.code) {
    case '23505': // Unique violation
      throw new ConflictError(
        `${entityName} already exists or unique constraint was violated: ${detail}`
      );
    case '23503': // Foreign key violation
      throw new BadRequestError(
        `Invalid reference in ${entityName}: ${detail}`
      );
    case '23502': // Not null violation
      throw new BadRequestError(
        `Missing required fields for ${entityName}: ${detail}`
      );
    case '22P02': // Invalid text representation (e.g. invalid UUID format)
      throw new BadRequestError(
        `Invalid format or ID for ${entityName}: ${pgError.message || detail}`
      );
    case 'PGRST116': // Single row not found
      throw new NotFoundError(`${entityName} not found`);
    default:
      throw new InternalServerError(
        `Database error while processing ${entityName}: ${pgError.message || String(error)}`
      );
  }
}
