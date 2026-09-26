import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'ai-engineering-os-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('db')
  async getDbHealth(@Res() res: Response) {
    const result = await this.healthService.checkDatabase();
    const statusCode =
      result.status === 'healthy'
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(result);
  }
}
