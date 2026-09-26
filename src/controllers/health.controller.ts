import { Request, Response } from 'express';
import { postgresManager } from '../db/postgres';

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }

  async getDatabaseHealth(_req: Request, res: Response): Promise<void> {
    try {
      const ping = await postgresManager.ping();
      res.status(200).json({
        status: 'healthy',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
        latencyMs: ping.latencyMs,
        serverTime: ping.serverTime,
        version: ping.version,
      });
    } catch (err: unknown) {
      const error = err as Error;
      res.status(503).json({
        status: 'unhealthy',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
        latencyMs: -1,
        error: error.message || 'Database connection failure',
      });
    }
  }
}

export const healthController = new HealthController();
