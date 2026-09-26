import {
  GitOrganizationsRepository,
  gitOrganizationsRepository,
} from '../repositories/git-organization.repository';
import { GitOrganization } from '../models/git-organization.model';
import { ConflictError, NotFoundError } from '../utils/app-error';

export class GitOrganizationsService {
  constructor(
    private readonly repo: GitOrganizationsRepository = gitOrganizationsRepository
  ) {}

  async createGitOrganization(
    integrationId: string,
    data: {
      external_id: string;
      name?: string;
      login: string;
      avatar_url?: string;
    }
  ): Promise<GitOrganization> {
    const existing = await this.repo.findByExternalId(
      integrationId,
      data.external_id
    );

    if (existing) {
      throw new ConflictError(
        `Git organization with external ID "${data.external_id}" is already linked to this integration`
      );
    }

    return this.repo.create({
      integration_id: integrationId,
      external_id: data.external_id,
      name: data.name,
      login: data.login,
      avatar_url: data.avatar_url,
    });
  }

  async getIntegrationGitOrganizations(
    integrationId: string
  ): Promise<GitOrganization[]> {
    return this.repo.findByIntegration(integrationId);
  }

  async getGitOrganization(id: string): Promise<GitOrganization> {
    const gitOrg = await this.repo.findById(id);
    if (!gitOrg) {
      throw new NotFoundError(`Git organization with ID "${id}" not found`);
    }
    return gitOrg;
  }

  async updateGitOrganization(
    id: string,
    data: { name?: string; login?: string; avatar_url?: string }
  ): Promise<GitOrganization> {
    const gitOrg = await this.repo.findById(id);
    if (!gitOrg) {
      throw new NotFoundError(`Git organization with ID "${id}" not found`);
    }

    return this.repo.update(id, data);
  }

  async deleteGitOrganization(id: string): Promise<boolean> {
    const gitOrg = await this.repo.findById(id);
    if (!gitOrg) {
      throw new NotFoundError(`Git organization with ID "${id}" not found`);
    }
    return this.repo.delete(id);
  }
}

export const gitOrganizationsService = new GitOrganizationsService();
