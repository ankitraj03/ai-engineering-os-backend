import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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
    throw new InternalServerErrorException('An unknown database error occurred');
  }

  if (error instanceof HttpException) {
    throw error;
  }

  const pgError = error as DatabaseErrorDetails;
  const detail = pgError.detail || pgError.details || pgError.message || '';

  // PostgreSQL standard error codes
  switch (pgError.code) {
    case '23505': // Unique violation
      throw new ConflictException(
        `${entityName} already exists or unique constraint was violated: ${detail}`
      );
    case '23503': // Foreign key violation
      throw new BadRequestException(
        `Invalid reference in ${entityName}: ${detail}`
      );
    case '23502': // Not null violation
      throw new BadRequestException(
        `Missing required fields for ${entityName}: ${detail}`
      );
    case '22P02': // Invalid text representation (e.g. invalid UUID)
      throw new BadRequestException(
        `Invalid format or ID for ${entityName}: ${pgError.message || detail}`
      );
    case 'PGRST116': // Single row not found
      throw new NotFoundException(`${entityName} not found`);
    default:
      throw new InternalServerErrorException(
        `Database error while processing ${entityName}: ${pgError.message || String(error)}`
      );
  }
}
