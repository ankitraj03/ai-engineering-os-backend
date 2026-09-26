import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GitOrganizationsRepository } from '../repositories/git-organizations.repository';
import { GitOrganization } from '../entities/git-organization.entity';
import { CreateGitOrganizationDto } from '../dto/create-git-organization.dto';
import { UpdateGitOrganizationDto } from '../dto/update-git-organization.dto';

@Injectable()
export class GitOrganizationsService {
  constructor(
    private readonly gitOrgsRepository: GitOrganizationsRepository
  ) {}

  async createGitOrganization(
    integrationId: string,
    dto: CreateGitOrganizationDto
  ): Promise<GitOrganization> {
    const existing = await this.gitOrgsRepository.findByExternalId(
      integrationId,
      dto.external_id
    );

    if (existing) {
      throw new ConflictException(
        `Git organization with external ID "${dto.external_id}" already exists for this integration`
      );
    }

    return this.gitOrgsRepository.create({
      integration_id: integrationId,
      external_id: dto.external_id,
      name: dto.name,
      login: dto.login,
      avatar_url: dto.avatar_url,
    });
  }

  async getGitOrganization(id: string): Promise<GitOrganization> {
    const gitOrg = await this.gitOrgsRepository.findById(id);
    if (!gitOrg) {
      throw new NotFoundException(`Git organization with ID "${id}" not found`);
    }
    return gitOrg;
  }

  async listGitOrganizations(
    integrationId: string
  ): Promise<GitOrganization[]> {
    return this.gitOrgsRepository.findByIntegration(integrationId);
  }

  async updateGitOrganization(
    id: string,
    dto: UpdateGitOrganizationDto
  ): Promise<GitOrganization> {
    const gitOrg = await this.gitOrgsRepository.findById(id);
    if (!gitOrg) {
      throw new NotFoundException(`Git organization with ID "${id}" not found`);
    }

    return this.gitOrgsRepository.update(id, {
      name: dto.name,
      login: dto.login,
      avatar_url: dto.avatar_url,
    });
  }

  async deleteGitOrganization(id: string): Promise<boolean> {
    const gitOrg = await this.gitOrgsRepository.findById(id);
    if (!gitOrg) {
      throw new NotFoundException(`Git organization with ID "${id}" not found`);
    }
    return this.gitOrgsRepository.delete(id);
  }
}
