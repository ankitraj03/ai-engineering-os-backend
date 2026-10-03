import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { RepositoryEntity } from '../entities/repository.entity';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';

export class RepositoryRepository {
  private get repo(): Repository<RepositoryEntity> {
    return getDataSource().getRepository(RepositoryEntity);
  }

  async create(data: {
    git_organization_id: string;
    external_id: string;
    name: string;
    full_name: string;
    default_branch?: string;
    is_private?: boolean;
    project_id?: string;
  }): Promise<RepositoryEntity> {
    try {
      const entity = this.repo.create({
        git_organization_id: data.git_organization_id,
        external_id: data.external_id,
        name: data.name,
        full_name: data.full_name,
        default_branch: data.default_branch || 'main',
        is_private: data.is_private ?? false,
        project_id: data.project_id || null,
      });

      return await this.repo.save(entity);
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }

  async findById(id: string): Promise<RepositoryEntity | null> {
    try {
      return await this.repo.findOneBy({ id });
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }

  async findByGitOrganization(gitOrganizationId: string): Promise<RepositoryEntity[]> {
    try {
      return await this.repo.find({
        where: { git_organization_id: gitOrganizationId },
        order: { created_at: 'ASC' },
      });
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }

  async findAll(): Promise<RepositoryEntity[]> {
    try {
      return await this.repo.find({
        order: { created_at: 'DESC' },
      });
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }

  async update(id: string, data: Partial<RepositoryEntity>): Promise<RepositoryEntity> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Repository with ID "${id}" not found`);
      }

      await this.repo.update(id, data);
      const updated = await this.repo.findOneBy({ id });
      return updated!;
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'Repository');
    }
  }
}

export const repositoryRepository = new RepositoryRepository();
