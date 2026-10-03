import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { IntegrationEntity } from '../entities/integration.entity';
import { Integration } from '../models/integration.model';
import { IntegrationProvider, IntegrationStatus } from '../models/enums';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';

export class IntegrationsRepository {
  private get repo(): Repository<IntegrationEntity> {
    return getDataSource().getRepository(IntegrationEntity);
  }

  private mapEntityToModel(entity: IntegrationEntity): Integration {
    return {
      id: entity.id,
      organization_id: entity.organization_id,
      provider: entity.provider,
      provider_account_id: entity.provider_account_id,
      status: entity.status,
      created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : String(entity.created_at),
      updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : String(entity.updated_at),
    };
  }

  async create(data: {
    organization_id: string;
    provider: IntegrationProvider;
    provider_account_id?: string;
    status?: IntegrationStatus;
  }): Promise<Integration> {
    try {
      const integration = this.repo.create({
        organization_id: data.organization_id,
        provider: data.provider,
        provider_account_id: data.provider_account_id || null,
        status: data.status || IntegrationStatus.ACTIVE,
      });

      const saved = await this.repo.save(integration);
      return this.mapEntityToModel(saved);
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findById(id: string): Promise<Integration | null> {
    try {
      const item = await this.repo.findOneBy({ id });
      return item ? this.mapEntityToModel(item) : null;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findByOrganization(organizationId: string): Promise<Integration[]> {
    try {
      const list = await this.repo.find({
        where: { organization_id: organizationId },
        order: { created_at: 'DESC' },
      });
      return list.map((i) => this.mapEntityToModel(i));
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findByProvider(
    organizationId: string,
    provider: string
  ): Promise<Integration | null> {
    try {
      const item = await this.repo.findOneBy({
        organization_id: organizationId,
        provider: provider as IntegrationProvider,
      });
      return item ? this.mapEntityToModel(item) : null;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async updateStatus(
    id: string,
    status: IntegrationStatus
  ): Promise<Integration> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Integration with ID "${id}" not found`);
      }

      await this.repo.update(id, { status });
      const updated = await this.repo.findOneBy({ id });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async update(
    id: string,
    data: Partial<{
      status: IntegrationStatus;
      provider_account_id: string;
    }>
  ): Promise<Integration> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Integration with ID "${id}" not found`);
      }

      await this.repo.update(id, {
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.provider_account_id !== undefined ? { provider_account_id: data.provider_account_id } : {}),
      });

      const updated = await this.repo.findOneBy({ id });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }
}

export const integrationsRepository = new IntegrationsRepository();
