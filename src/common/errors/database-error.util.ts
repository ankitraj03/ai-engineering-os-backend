import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';

export function handleDatabaseError(
  error: PostgrestError | Error | null | unknown,
  entityName = 'Resource'
): never {
  if (!error) {
    throw new InternalServerErrorException('An unknown database error occurred');
  }

  if (error instanceof HttpException) {
    throw error;
  }

  const pgError = error as PostgrestError;

  // Postgrest / PostgreSQL error codes
  switch (pgError.code) {
    case '23505': // Unique violation
      throw new ConflictException(
        `${entityName} already exists or unique constraint was violated: ${pgError.details || pgError.message}`
      );
    case '23503': // Foreign key violation
      throw new BadRequestException(
        `Invalid reference in ${entityName}: ${pgError.details || pgError.message}`
      );
    case '23502': // Not null violation
      throw new BadRequestException(
        `Missing required fields for ${entityName}: ${pgError.details || pgError.message}`
      );
    case '22P02': // Invalid text representation (e.g. invalid UUID)
      throw new BadRequestException(
        `Invalid format or ID for ${entityName}: ${pgError.message}`
      );
    case 'PGRST116': // Single row not found
      throw new NotFoundException(`${entityName} not found`);
    default:
      throw new InternalServerErrorException(
        `Database error while processing ${entityName}: ${pgError.message || String(error)}`
      );
  }
}
