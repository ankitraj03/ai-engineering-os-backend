import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { GitOrganizationEntity } from '../entities/git-organization.entity';
import { GitOrganization } from '../models/git-organization.model';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';

export class GitOrganizationsRepository {
  private get repo(): Repository<GitOrganizationEntity> {
    return getDataSource().getRepository(GitOrganizationEntity);
  }

  private mapEntityToModel(entity: GitOrganizationEntity): GitOrganization {
    return {
      id: entity.id,
      integration_id: entity.integration_id,
      external_id: entity.external_id,
      name: entity.name,
      login: entity.login,
      avatar_url: entity.avatar_url,
      created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : String(entity.created_at),
      updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : String(entity.updated_at),
    };
  }

  async create(data: {
    integration_id: string;
    external_id: string;
    name?: string;
    login: string;
    avatar_url?: string;
  }): Promise<GitOrganization> {
    try {
      const gitOrg = this.repo.create({
        integration_id: data.integration_id,
        external_id: data.external_id,
        name: data.name || null,
        login: data.login,
        avatar_url: data.avatar_url || null,
      });

      const saved = await this.repo.save(gitOrg);
      return this.mapEntityToModel(saved);
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findById(id: string): Promise<GitOrganization | null> {
    try {
      const item = await this.repo.findOneBy({ id });
      return item ? this.mapEntityToModel(item) : null;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findByIntegration(integrationId: string): Promise<GitOrganization[]> {
    try {
      const list = await this.repo.find({
        where: { integration_id: integrationId },
        order: { created_at: 'ASC' },
      });
      return list.map((g) => this.mapEntityToModel(g));
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findByExternalId(
    integrationId: string,
    externalId: string
  ): Promise<GitOrganization | null> {
    try {
      const item = await this.repo.findOneBy({
        integration_id: integrationId,
        external_id: externalId,
      });
      return item ? this.mapEntityToModel(item) : null;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      login: string;
      avatar_url: string;
    }>
  ): Promise<GitOrganization> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Git organization with ID "${id}" not found`);
      }

      await this.repo.update(id, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.login !== undefined ? { login: data.login } : {}),
        ...(data.avatar_url !== undefined ? { avatar_url: data.avatar_url } : {}),
      });

      const updated = await this.repo.findOneBy({ id });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }
}

export const gitOrganizationsRepository = new GitOrganizationsRepository();
