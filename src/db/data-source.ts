import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDatabaseConfig, maskDatabaseUrl } from '../config/database.config';
import { logger } from '../utils/logger';

let dataSourceInstance: DataSource | null = null;

/**
 * Returns the singleton TypeORM DataSource instance.
 * Lazy-instantiates the DataSource with centralized configuration.
 */
export function getDataSource(): DataSource {
  if (!dataSourceInstance) {
    const config = getDatabaseConfig();
    dataSourceInstance = new DataSource(config);
  }
  return dataSourceInstance;
}

/**
 * Initialize the PostgreSQL TypeORM DataSource connection.
 * Validates connection before allowing HTTP server to accept traffic.
 */
export async function initializeDatabase(): Promise<DataSource> {
  const dataSource = getDataSource();

  if (dataSource.isInitialized) {
    return dataSource;
  }

  try {
    const maskedUrl = maskDatabaseUrl(process.env.DATABASE_URL);
    logger.log(`Connecting to PostgreSQL database (${maskedUrl})...`);

    await dataSource.initialize();

    // Verify connectivity with a quick test query
    const start = Date.now();
    const result = await dataSource.query('SELECT NOW() as now, version() as version;');
    const latency = Date.now() - start;

    const version = result[0]?.version?.split(' ')?.[0] || 'PostgreSQL';
    logger.log('================================================================');
    logger.log('✔ PostgreSQL Database connected successfully via TypeORM!');
    logger.log(`  Engine:   ${version}`);
    logger.log(`  Latency:  ${latency}ms`);
    logger.log('================================================================');

    return dataSource;
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    // Sanitize any sensitive details from the error message
    const sanitizedMessage = maskDatabaseUrl(err?.message || String(error));

    logger.error('================================================================');
    logger.error(`✖ Database connection failed: ${sanitizedMessage}`);
    if (err?.code) {
      logger.error(`  Error Code: ${err.code}`);
    }
    logger.error('================================================================');

    throw new Error(`Database connection failed: ${sanitizedMessage}`);
  }
}

/**
 * Pings the database for readiness and liveness checks.
 */
export async function pingDatabase(): Promise<{
  connected: boolean;
  latencyMs: number;
  serverTime?: string;
  version?: string;
}> {
  const dataSource = getDataSource();

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const start = Date.now();
  const result = await dataSource.query('SELECT NOW() as now, version() as version;');
  const latencyMs = Date.now() - start;

  return {
    connected: true,
    latencyMs,
    serverTime: result[0]?.now ? new Date(result[0].now).toISOString() : undefined,
    version: result[0]?.version,
  };
}

/**
 * Closes the TypeORM connection pool gracefully.
 */
export async function closeDatabase(): Promise<void> {
  if (dataSourceInstance && dataSourceInstance.isInitialized) {
    await dataSourceInstance.destroy();
    dataSourceInstance = null;
    logger.log('PostgreSQL TypeORM connection pool closed cleanly.');
  }
}

export const AppDataSource = getDataSource();
