import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  // Determine if target is a remote Supabase host or local
  const isSupabase =
    (databaseUrl && databaseUrl.includes('supabase.')) ||
    (process.env.DB_HOST && process.env.DB_HOST.includes('supabase.'));

  // Default SSL: required for Supabase, optional/false for localhost unless specified
  let isSslEnabled = false;
  if (process.env.DB_SSL !== undefined) {
    isSslEnabled = process.env.DB_SSL === 'true';
  } else if (isSupabase) {
    isSslEnabled = true;
  }

  const sslConfig = isSslEnabled
    ? {
        rejectUnauthorized: false,
      }
    : false;

  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    // CRITICAL: synchronize MUST BE FALSE to prevent accidental schema destruction in shared database
    synchronize: false,
    autoLoadEntities: true,
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    retryAttempts: 3,
    retryDelay: 2000,
    ssl: sslConfig,
    extra: {
      ...(sslConfig ? { ssl: sslConfig } : {}),
      // Connection pool configuration
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT || '10000', 10),
    },
  };

  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
    };
  }

  return {
    ...baseConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
  };
};
