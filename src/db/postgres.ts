import { Pool, PoolConfig } from 'pg';
import { envConfig } from '../config/env.config';

class PostgresManager {
  private static instance: PostgresManager;
  private pool: Pool | null = null;

  private constructor() {
    this.initPool();
  }

  public static getInstance(): PostgresManager {
    if (!PostgresManager.instance) {
      PostgresManager.instance = new PostgresManager();
    }
    return PostgresManager.instance;
  }

  private initPool() {
    const connectionString = envConfig.databaseUrl;
    if (!connectionString) {
      return;
    }

    const config: PoolConfig = {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      console.error('[PostgresPool] Unexpected client error on idle client:', err.message);
    });
  }

  public getPool(): Pool | null {
    if (!this.pool && envConfig.databaseUrl) {
      this.initPool();
    }
    return this.pool;
  }

  public async ping(): Promise<{ latencyMs: number; serverTime: string; version: string }> {
    const pool = this.getPool();
    if (!pool) {
      throw new Error('Database pool not configured (missing DATABASE_URL)');
    }

    const start = Date.now();
    const result = await pool.query('SELECT NOW() as now, version() as version');
    const latencyMs = Date.now() - start;

    return {
      latencyMs,
      serverTime: result.rows[0].now.toISOString(),
      version: result.rows[0].version,
    };
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export const postgresManager = PostgresManager.getInstance();
