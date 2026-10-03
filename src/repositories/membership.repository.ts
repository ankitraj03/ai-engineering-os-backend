import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { OrganizationMembershipEntity } from '../entities/membership.entity';
import { OrganizationMembership } from '../models/membership.model';
import { MembershipRole, MembershipStatus } from '../models/enums';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';

export class OrganizationMembershipsRepository {
  private get repo(): Repository<OrganizationMembershipEntity> {
    return getDataSource().getRepository(OrganizationMembershipEntity);
  }

  private mapEntityToModel(entity: OrganizationMembershipEntity): OrganizationMembership {
    return {
      id: entity.id,
      organization_id: entity.organization_id,
      user_id: entity.user_id,
      role: entity.role,
      status: entity.status,
      joined_at: entity.joined_at instanceof Date ? entity.joined_at.toISOString() : (entity.joined_at || null),
      created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : String(entity.created_at),
      updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : String(entity.updated_at),
      user: entity.user ? {
        id: entity.user.id,
        email: entity.user.email,
        full_name: entity.user.full_name,
        avatar_url: entity.user.avatar_url,
        created_at: entity.user.created_at instanceof Date ? entity.user.created_at.toISOString() : String(entity.user.created_at),
        updated_at: entity.user.updated_at instanceof Date ? entity.user.updated_at.toISOString() : String(entity.user.updated_at),
      } : undefined,
    };
  }

  async create(data: {
    organization_id: string;
    user_id: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }): Promise<OrganizationMembership> {
    try {
      const membership = this.repo.create({
        organization_id: data.organization_id,
        user_id: data.user_id,
        role: data.role,
        status: data.status || MembershipStatus.ACTIVE,
        joined_at: data.status === MembershipStatus.INVITED ? null : new Date(),
      });

      const saved = await this.repo.save(membership);
      const withUser = await this.repo.findOne({
        where: { id: saved.id },
        relations: ['user'],
      });

      return this.mapEntityToModel(withUser || saved);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findById(id: string): Promise<OrganizationMembership | null> {
    try {
      const membership = await this.repo.findOne({
        where: { id },
        relations: ['user'],
      });
      return membership ? this.mapEntityToModel(membership) : null;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrganizationMembership | null> {
    try {
      const membership = await this.repo.findOne({
        where: { user_id: userId, organization_id: organizationId },
        relations: ['user'],
      });
      return membership ? this.mapEntityToModel(membership) : null;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByOrganization(
    organizationId: string
  ): Promise<OrganizationMembership[]> {
    try {
      const list = await this.repo.find({
        where: { organization_id: organizationId },
        relations: ['user'],
        order: { created_at: 'ASC' },
      });
      return list.map((m) => this.mapEntityToModel(m));
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByUser(userId: string): Promise<OrganizationMembership[]> {
    try {
      const list = await this.repo.find({
        where: { user_id: userId },
      });
      return list.map((m) => this.mapEntityToModel(m));
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async updateRole(
    id: string,
    role: MembershipRole
  ): Promise<OrganizationMembership> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Membership with ID "${id}" not found`);
      }

      await this.repo.update(id, { role });

      const updated = await this.repo.findOne({
        where: { id },
        relations: ['user'],
      });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async updateStatus(
    id: string,
    status: MembershipStatus
  ): Promise<OrganizationMembership> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`Membership with ID "${id}" not found`);
      }

      await this.repo.update(id, {
        status,
        joined_at: status === MembershipStatus.ACTIVE ? new Date() : undefined,
      });

      const updated = await this.repo.findOne({
        where: { id },
        relations: ['user'],
      });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async countOwners(organizationId: string): Promise<number> {
    try {
      return await this.repo.count({
        where: {
          organization_id: organizationId,
          role: MembershipRole.OWNER,
          status: MembershipStatus.ACTIVE,
        },
      });
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }
}

export const organizationMembershipsRepository = new OrganizationMembershipsRepository();
