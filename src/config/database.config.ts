import * as dotenv from 'dotenv';
import * as path from 'path';

// Ensure environment variables are loaded
dotenv.config({
  path: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env')],
  override: true,
});

import { DataSourceOptions } from 'typeorm';
import {
  UserEntity,
  OrganizationEntity,
  OrganizationMembershipEntity,
  IntegrationEntity,
  GitOrganizationEntity,
  RepositoryEntity,
  ImportedRepositoryEntity,
} from '../entities';
import { AddPasswordHashAndImportedRepositories1727950000000 } from '../migrations/1727950000000-AddPasswordHashAndImportedRepositories';

export interface DatabasePoolConfig {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Mask credentials in database URLs for safe logging.
 * Replaces :password@ with :***@
 */
export function maskDatabaseUrl(url?: string): string {
  if (!url) return '';
  return url.replace(/:\/\/([^:]+):([^@]+)@/g, '://$1:***@');
}

/**
 * Validates that DATABASE_URL is present and non-empty.
 * Throws or logs without silent fallback.
 */
export function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === '') {
    console.error('DATABASE_URL is not configured');
    throw new Error('DATABASE_URL is not configured');
  }

  return databaseUrl.trim();
}

/**
 * Determines SSL configuration in a provider-agnostic way.
 * Follows DB_SSL environment setting or standard connection string parameters.
 */
function resolveSslConfig(url: string): boolean | { rejectUnauthorized: boolean } | undefined {
  if (process.env.DB_SSL === 'true') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DB_SSL === 'false') {
    return false;
  }
  if (url.includes('sslmode=disable')) {
    return false;
  }
  if (url.includes('sslmode=require') || url.includes('ssl=true')) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

/**
 * Single source of truth for PostgreSQL TypeORM DataSource configuration.
 * Reads DATABASE_URL and pool settings entirely from the environment.
 */
export function getDatabaseConfig(): DataSourceOptions {
  const databaseUrl = getDatabaseUrl();

  const poolSize = parseInt(process.env.DB_POOL_SIZE || process.env.DB_POOL_MAX || '10', 10);
  const connectionTimeout = parseInt(process.env.DB_TIMEOUT || '10000', 10);

  const sslConfig = resolveSslConfig(databaseUrl);

  const options: DataSourceOptions = {
    type: 'postgres',
    url: databaseUrl,
    // CRITICAL: synchronize MUST be false to prevent schema destruction
    synchronize: false,
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    entities: [
      UserEntity,
      OrganizationEntity,
      OrganizationMembershipEntity,
      IntegrationEntity,
      GitOrganizationEntity,
      RepositoryEntity,
      ImportedRepositoryEntity,
    ],
    migrations: [AddPasswordHashAndImportedRepositories1727950000000],
    extra: {
      max: poolSize,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: connectionTimeout,
      ...(sslConfig !== undefined ? { ssl: sslConfig } : {}),
    },
    ...(sslConfig !== undefined ? { ssl: sslConfig } : {}),
  };

  return options;
}
