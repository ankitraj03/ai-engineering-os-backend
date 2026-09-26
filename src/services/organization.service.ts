import {
  OrganizationsRepository,
  organizationsRepository,
} from '../repositories/organization.repository';
import { Organization } from '../models/organization.model';
import { ConflictError, NotFoundError } from '../utils/app-error';

export class OrganizationsService {
  constructor(
    private readonly repo: OrganizationsRepository = organizationsRepository
  ) {}

  async createOrganization(
    userId: string,
    data: { name: string; slug: string; logo_url?: string }
  ): Promise<{ organization: Organization; membership: any }> {
    const existing = await this.repo.findBySlug(data.slug);
    if (existing) {
      throw new ConflictError(
        `Organization with slug "${data.slug}" already exists`
      );
    }

    return this.repo.createWithOwner(
      data.name,
      data.slug,
      data.logo_url,
      userId
    );
  }

  async getOrganization(id: string): Promise<Organization> {
    const organization = await this.repo.findById(id);
    if (!organization) {
      throw new NotFoundError(`Organization with ID "${id}" not found`);
    }
    return organization;
  }

  async getUserOrganizations(
    userId: string
  ): Promise<Array<Organization & { role: string }>> {
    return this.repo.findByUserId(userId);
  }

  async updateOrganization(
    id: string,
    data: { name?: string; slug?: string; logo_url?: string }
  ): Promise<Organization> {
    const org = await this.repo.findById(id);
    if (!org) {
      throw new NotFoundError(`Organization with ID "${id}" not found`);
    }

    if (data.slug && data.slug !== org.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing) {
        throw new ConflictError(
          `Organization with slug "${data.slug}" already exists`
        );
      }
    }

    return this.repo.update(id, {
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url,
    });
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const org = await this.repo.findById(id);
    if (!org) {
      throw new NotFoundError(`Organization with ID "${id}" not found`);
    }
    return this.repo.delete(id);
  }
}

export const organizationsService = new OrganizationsService();
