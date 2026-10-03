import { Request, Response } from 'express';
import { pingDatabase } from '../db/data-source';

export class HealthController {
  getHealth(_req: Request, res: Response): void {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  }

  async getDatabaseHealth(_req: Request, res: Response): Promise<void> {
    try {
      const ping = await pingDatabase();
      res.status(200).json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
        latencyMs: ping.latencyMs,
        serverTime: ping.serverTime,
        version: ping.version,
      });
    } catch {
      // Do not expose database passwords, full DATABASE_URL, or credentials
      res.status(503).json({
        status: 'error',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const healthController = new HealthController();
