import { Module } from '@nestjs/common';
import { IntegrationsController } from './controllers/integrations.controller';
import { IntegrationsService } from './services/integrations.service';
import { IntegrationsRepository } from './repositories/integrations.repository';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, IntegrationsRepository],
  exports: [IntegrationsService, IntegrationsRepository],
})
export class IntegrationsModule {}
