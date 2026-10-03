import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { OrganizationEntity } from '../entities/organization.entity';
import { OrganizationMembershipEntity } from '../entities/membership.entity';
import { Organization } from '../models/organization.model';
import { MembershipRole, MembershipStatus } from '../models/enums';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';

export class OrganizationsRepository {
  private get repo(): Repository<OrganizationEntity> {
    return getDataSource().getRepository(OrganizationEntity);
  }

  private mapEntityToModel(entity: OrganizationEntity): Organization {
    return {
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      logo_url: entity.logo_url,
      created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : String(entity.created_at),
      updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : String(entity.updated_at),
    };
  }

  async create(data: {
    name: string;
    slug: string;
    logo_url?: string;
  }): Promise<Organization> {
    try {
      const org = this.repo.create({
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url || null,
        plan: 'Starter',
      });
      const saved = await this.repo.save(org);
      return this.mapEntityToModel(saved);
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  /**
   * Atomically creates an organization and associates the creator as OWNER
   * using a provider-agnostic TypeORM transaction.
   */
  async createWithOwner(
    name: string,
    slug: string,
    logoUrl: string | undefined,
    ownerUserId: string
  ): Promise<{ organization: Organization; membership: any }> {
    try {
      return await getDataSource().transaction(async (manager) => {
        const orgRepo = manager.getRepository(OrganizationEntity);
        const memRepo = manager.getRepository(OrganizationMembershipEntity);

        const newOrg = orgRepo.create({
          name,
          slug,
          logo_url: logoUrl || null,
          plan: 'Starter',
        });
        const savedOrg = await orgRepo.save(newOrg);

        const newMembership = memRepo.create({
          organization_id: savedOrg.id,
          user_id: ownerUserId,
          role: MembershipRole.OWNER,
          status: MembershipStatus.ACTIVE,
          joined_at: new Date(),
        });
        const savedMembership = await memRepo.save(newMembership);

        return {
          organization: this.mapEntityToModel(savedOrg),
          membership: {
            id: savedMembership.id,
            organization_id: savedMembership.organization_id,
            user_id: savedMembership.user_id,
            role: savedMembership.role,
            status: savedMembership.status,
            joined_at: savedMembership.joined_at?.toISOString() || null,
            created_at: savedMembership.created_at?.toISOString() || new Date().toISOString(),
            updated_at: savedMembership.updated_at?.toISOString() || new Date().toISOString(),
          },
        };
      });
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      const org = await this.repo.findOneBy({ id });
      return org ? this.mapEntityToModel(org) : null;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      const org = await this.repo.findOneBy({ slug });
      return org ? this.mapEntityToModel(org) : null;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findByUserId(userId: string): Promise<Array<Organization & { role: string }>> {
    try {
      const memRepo = getDataSource().getRepository(OrganizationMembershipEntity);
      const memberships = await memRepo.find({
        where: { user_id: userId, status: MembershipStatus.ACTIVE },
        relations: ['organization'],
      });

      return memberships
        .filter((m) => !!m.organization)
        .map((m) => ({
          ...this.mapEntityToModel(m.organization!),
          role: m.role,
        }));
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; logo_url: string }>
  ): Promise<Organization> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Organization with ID "${id}" not found`);
      }

      await this.repo.update(id, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.logo_url !== undefined ? { logo_url: data.logo_url } : {}),
      });

      const updated = await this.repo.findOneBy({ id });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }
}

export const organizationsRepository = new OrganizationsRepository();
