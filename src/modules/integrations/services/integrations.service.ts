import { Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationsRepository } from '../repositories/integrations.repository';
import { Integration } from '../entities/integration.entity';
import { CreateIntegrationDto } from '../dto/create-integration.dto';
import { UpdateIntegrationDto } from '../dto/update-integration.dto';
import { IntegrationStatus } from '../../../common/types/enums';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly integrationsRepository: IntegrationsRepository
  ) {}

  async createIntegration(
    organizationId: string,
    dto: CreateIntegrationDto
  ): Promise<Integration> {
    return this.integrationsRepository.create({
      organization_id: organizationId,
      provider: dto.provider,
      provider_account_id: dto.provider_account_id,
      status: dto.status,
    });
  }

  async getIntegration(id: string): Promise<Integration> {
    const integration = await this.integrationsRepository.findById(id);
    if (!integration) {
      throw new NotFoundException(`Integration with ID "${id}" not found`);
    }
    return integration;
  }

  async listByOrganization(organizationId: string): Promise<Integration[]> {
    return this.integrationsRepository.findByOrganization(organizationId);
  }

  async updateIntegration(
    id: string,
    dto: UpdateIntegrationDto
  ): Promise<Integration> {
    const integration = await this.integrationsRepository.findById(id);
    if (!integration) {
      throw new NotFoundException(`Integration with ID "${id}" not found`);
    }

    return this.integrationsRepository.update(id, {
      status: dto.status,
      provider_account_id: dto.provider_account_id,
    });
  }

  async disconnectIntegration(id: string): Promise<Integration> {
    const integration = await this.integrationsRepository.findById(id);
    if (!integration) {
      throw new NotFoundException(`Integration with ID "${id}" not found`);
    }

    return this.integrationsRepository.updateStatus(
      id,
      IntegrationStatus.DISCONNECTED
    );
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const integration = await this.integrationsRepository.findById(id);
    if (!integration) {
      throw new NotFoundException(`Integration with ID "${id}" not found`);
    }
    return this.integrationsRepository.delete(id);
  }
}
