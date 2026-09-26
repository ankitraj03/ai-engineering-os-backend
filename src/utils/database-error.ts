import { PostgrestError } from '@supabase/supabase-js';
import {
  AppError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from './app-error';

export function handleDatabaseError(
  error: PostgrestError | Error | null | unknown,
  entityName = 'Resource'
): never {
  if (!error) {
    throw new InternalServerError('An unknown database error occurred');
  }

  if (error instanceof AppError) {
    throw error;
  }

  const pgError = error as PostgrestError;

  // Postgrest / PostgreSQL error codes
  switch (pgError.code) {
    case '23505': // Unique violation
      throw new ConflictError(
        `${entityName} already exists or unique constraint was violated: ${pgError.details || pgError.message}`
      );
    case '23503': // Foreign key violation
      throw new BadRequestError(
        `Invalid reference in ${entityName}: ${pgError.details || pgError.message}`
      );
    case '23502': // Not null violation
      throw new BadRequestError(
        `Missing required fields for ${entityName}: ${pgError.details || pgError.message}`
      );
    case '22P02': // Invalid text representation (e.g. invalid UUID)
      throw new BadRequestError(
        `Invalid format or ID for ${entityName}: ${pgError.message}`
      );
    case 'PGRST116': // Single row not found
      throw new NotFoundError(`${entityName} not found`);
    default:
      throw new InternalServerError(
        `Database error while processing ${entityName}: ${pgError.message || String(error)}`
      );
  }
}
