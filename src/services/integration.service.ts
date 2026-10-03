import {
  IntegrationsRepository,
  integrationsRepository,
} from '../repositories/integration.repository';
import { Integration } from '../models/integration.model';
import { IntegrationProvider, IntegrationStatus } from '../models/enums';
import { ConflictError, NotFoundError } from '../utils/app-error';

export class IntegrationsService {
  constructor(
    private readonly repo: IntegrationsRepository = integrationsRepository
  ) {}

  async createIntegration(
    organizationId: string,
    data: { provider: IntegrationProvider; provider_account_id?: string }
  ): Promise<Integration> {
    const existing = await this.repo.findByProvider(
      organizationId,
      data.provider
    );

    if (existing) {
      throw new ConflictError(
        `Integration provider "${data.provider}" is already configured for this organization`
      );
    }

    return this.repo.create({
      organization_id: organizationId,
      provider: data.provider,
      provider_account_id: data.provider_account_id,
      status: IntegrationStatus.ACTIVE,
    });
  }

  async getOrganizationIntegrations(
    organizationId: string
  ): Promise<Integration[]> {
    return this.repo.findByOrganization(organizationId);
  }

  async getIntegration(id: string): Promise<Integration> {
    const integration = await this.repo.findById(id);
    if (!integration) {
      throw new NotFoundError(`Integration with ID "${id}" not found`);
    }
    return integration;
  }

  async updateIntegrationStatus(
    id: string,
    status: IntegrationStatus
  ): Promise<Integration> {
    const integration = await this.repo.findById(id);
    if (!integration) {
      throw new NotFoundError(`Integration with ID "${id}" not found`);
    }
    return this.repo.updateStatus(id, status);
  }

  async deleteIntegration(id: string): Promise<boolean> {
    const integration = await this.repo.findById(id);
    if (!integration) {
      throw new NotFoundError(`Integration with ID "${id}" not found`);
    }
    return this.repo.delete(id);
  }
}

export const integrationsService = new IntegrationsService();
