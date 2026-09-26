import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface DbHealthResult {
  status: 'healthy' | 'unhealthy';
  database: string;
  timestamp: string;
  latencyMs?: number;
  serverTime?: string;
  version?: string;
  error?: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async checkDatabase(): Promise<DbHealthResult> {
    const timestamp = new Date().toISOString();
    const start = Date.now();

    try {
      const result = await this.databaseService.query(
        'SELECT NOW() as now, version() as version;'
      );
      const latencyMs = Date.now() - start;

      return {
        status: 'healthy',
        database: 'postgresql',
        timestamp,
        latencyMs,
        serverTime: result[0]?.now ? new Date(result[0].now).toISOString() : undefined,
        version: result[0]?.version,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Database health check failed: ${err?.message || String(error)}`);
      return {
        status: 'unhealthy',
        database: 'postgresql',
        timestamp,
        latencyMs: Date.now() - start,
        error: err?.message || 'Database query failed',
      };
    }
  }
}
