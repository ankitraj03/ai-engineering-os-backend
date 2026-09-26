import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { Organization } from '../entities/organization.entity';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository
  ) {}

  async createOrganization(
    userId: string,
    dto: CreateOrganizationDto
  ): Promise<{ organization: Organization; membership: any }> {
    const existing = await this.organizationsRepository.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException(
        `Organization with slug "${dto.slug}" already exists`
      );
    }

    return this.organizationsRepository.createWithOwner(
      dto.name,
      dto.slug,
      dto.logo_url,
      userId
    );
  }

  async getOrganization(id: string): Promise<Organization> {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    return organization;
  }

  async getUserOrganizations(
    userId: string
  ): Promise<Array<Organization & { role: string }>> {
    return this.organizationsRepository.findByUserId(userId);
  }

  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<Organization> {
    const org = await this.organizationsRepository.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== org.slug) {
      const existing = await this.organizationsRepository.findBySlug(dto.slug);
      if (existing) {
        throw new ConflictException(
          `Organization with slug "${dto.slug}" already exists`
        );
      }
    }

    return this.organizationsRepository.update(id, {
      name: dto.name,
      slug: dto.slug,
      logo_url: dto.logo_url,
    });
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const org = await this.organizationsRepository.findById(id);
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }
    return this.organizationsRepository.delete(id);
  }
}
