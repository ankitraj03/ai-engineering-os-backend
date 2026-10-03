import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { maskDatabaseUrl } from '../config/database.config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.verifyConnection();
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      // Execute lightweight query to verify connectivity
      const start = Date.now();
      const result = await this.dataSource.query('SELECT NOW() as now, version() as version;');
      const duration = Date.now() - start;

      const dbTime = result[0]?.now;
      const dbVersion = result[0]?.version?.split(' ')?.[0] || 'PostgreSQL';

      this.logger.log('================================================================');
      this.logger.log('✔ DATABASE CONNECTION SUCCESSFUL');
      this.logger.log(`  Engine: ${dbVersion}`);
      this.logger.log(`  Database Time: ${dbTime}`);
      this.logger.log(`  Ping Latency: ${duration}ms`);
      this.logger.log('================================================================');

      return true;
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      const sanitizedError = maskDatabaseUrl(err?.message || String(error));

      this.logger.error('================================================================');
      this.logger.error('✖ DATABASE CONNECTION FAILED');
      this.logger.error(`  Error: ${sanitizedError}`);
      if (err?.code) {
        this.logger.error(`  Error Code: ${err.code}`);
      }
      this.logger.error('');
      this.logger.error('  TROUBLESHOOTING CHECKLIST:');
      this.logger.error('  1. Ensure DATABASE_URL is set in backend/.env');
      this.logger.error('     Format: postgresql://username:password@host:port/database');
      this.logger.error('  2. Verify your PostgreSQL database credentials and host accessibility.');
      this.logger.error('  3. Ensure network connectivity to the PostgreSQL host.');
      this.logger.error('  4. If your provider requires SSL, ensure SSL is configured or enabled via DB_SSL.');
      this.logger.error('================================================================');

      return false;
    }
  }

  async query<T = unknown>(sql: string, parameters?: unknown[]): Promise<T> {
    return this.dataSource.query(sql, parameters);
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
