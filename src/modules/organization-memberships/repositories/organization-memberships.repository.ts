import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { OrganizationMembership } from '../entities/organization-membership.entity';
import { MembershipRole, MembershipStatus } from '../../../common/types/enums';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class OrganizationMembershipsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private mapRowToMembership(row: any): OrganizationMembership {
    if (!row) return row;
    const membership = { ...row };
    if (row.u_id) {
      membership.user = {
        id: row.u_id,
        email: row.u_email,
        full_name: row.u_full_name,
        avatar_url: row.u_avatar_url,
      };
      delete membership.u_id;
      delete membership.u_email;
      delete membership.u_full_name;
      delete membership.u_avatar_url;
    }
    return membership;
  }

  async create(data: {
    organization_id: string;
    user_id: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }): Promise<OrganizationMembership> {
    try {
      const status = data.status || MembershipStatus.ACTIVE;
      const joinedAt = status === MembershipStatus.INVITED ? null : new Date().toISOString();
      
      const rows = await this.databaseService.query<any[]>(
        `WITH inserted AS (
           INSERT INTO organization_memberships (organization_id, user_id, role, status, joined_at)
           VALUES ($1, $2, $3, $4, $5) RETURNING *
         )
         SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM inserted m
         LEFT JOIN users u ON m.user_id = u.id`,
        [data.organization_id, data.user_id, data.role, status, joinedAt]
      );
      return this.mapRowToMembership(rows[0]);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findById(id: string): Promise<OrganizationMembership | null> {
    try {
      const rows = await this.databaseService.query<any[]>(
        `SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM organization_memberships m
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.id = $1 LIMIT 1`,
        [id]
      );
      return this.mapRowToMembership(rows[0]) || null;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrganizationMembership | null> {
    try {
      const rows = await this.databaseService.query<any[]>(
        `SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM organization_memberships m
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.user_id = $1 AND m.organization_id = $2 LIMIT 1`,
        [userId, organizationId]
      );
      return this.mapRowToMembership(rows[0]) || null;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByOrganization(
    organizationId: string
  ): Promise<OrganizationMembership[]> {
    try {
      const rows = await this.databaseService.query<any[]>(
        `SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM organization_memberships m
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.organization_id = $1
         ORDER BY m.created_at ASC`,
        [organizationId]
      );
      return rows.map(r => this.mapRowToMembership(r));
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async findByUser(userId: string): Promise<OrganizationMembership[]> {
    try {
      const rows = await this.databaseService.query<OrganizationMembership[]>(
        `SELECT * FROM organization_memberships WHERE user_id = $1`,
        [userId]
      );
      return rows;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async updateRole(
    id: string,
    role: MembershipRole
  ): Promise<OrganizationMembership> {
    try {
      const rows = await this.databaseService.query<any[]>(
        `WITH updated AS (
           UPDATE organization_memberships 
           SET role = $1, updated_at = $2 
           WHERE id = $3 RETURNING *
         )
         SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM updated m
         LEFT JOIN users u ON m.user_id = u.id`,
        [role, new Date().toISOString(), id]
      );
      return this.mapRowToMembership(rows[0]);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async updateStatus(
    id: string,
    status: MembershipStatus
  ): Promise<OrganizationMembership> {
    try {
      const joinedAt = status === MembershipStatus.ACTIVE ? new Date().toISOString() : null;
      let query = `UPDATE organization_memberships SET status = $1, updated_at = $2`;
      let params = [status, new Date().toISOString(), id];
      
      if (joinedAt) {
        query += `, joined_at = $4`;
        params.push(joinedAt);
      }
      
      query += ` WHERE id = $3 RETURNING *`;
      
      const rows = await this.databaseService.query<any[]>(
        `WITH updated AS (${query})
         SELECT m.*, u.id as u_id, u.email as u_email, u.full_name as u_full_name, u.avatar_url as u_avatar_url
         FROM updated m
         LEFT JOIN users u ON m.user_id = u.id`,
        params
      );
      return this.mapRowToMembership(rows[0]);
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async countOwners(organizationId: string): Promise<number> {
    try {
      const rows = await this.databaseService.query<any[]>(
        `SELECT COUNT(id) as count FROM organization_memberships
         WHERE organization_id = $1 AND role = $2 AND status = $3`,
        [organizationId, MembershipRole.OWNER, MembershipStatus.ACTIVE]
      );
      return parseInt(rows[0].count, 10) || 0;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.databaseService.query(`DELETE FROM organization_memberships WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }
  }
}
