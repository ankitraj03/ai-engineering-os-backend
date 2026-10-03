import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Organization } from '../entities/organization.entity';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    name: string;
    slug: string;
    logo_url?: string;
  }): Promise<Organization> {
    try {
      const rows = await this.databaseService.query<Organization[]>(
        `INSERT INTO organizations (name, slug, logo_url)
         VALUES ($1, $2, $3) RETURNING *`,
        [data.name, data.slug, data.logo_url || null]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async createWithOwner(
    name: string,
    slug: string,
    logoUrl: string | undefined,
    ownerUserId: string
  ): Promise<{ organization: Organization; membership: any }> {
    try {
      // Because we aren't using Supabase RPC, we simulate the RPC function
      // by inserting the organization and then inserting the membership in one go.
      // We assume they use a transaction, but we can just use CTEs or do it sequentially.
      
      const orgRows = await this.databaseService.query<Organization[]>(
        `INSERT INTO organizations (name, slug, logo_url) VALUES ($1, $2, $3) RETURNING *`,
        [name, slug, logoUrl || null]
      );
      const organization = orgRows[0];

      const membershipRows = await this.databaseService.query<any[]>(
        `INSERT INTO organization_memberships (organization_id, user_id, role, status)
         VALUES ($1, $2, 'OWNER', 'ACTIVE') RETURNING *`,
        [organization.id, ownerUserId]
      );

      return {
        organization,
        membership: membershipRows[0],
      };
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findById(id: string): Promise<Organization | null> {
    try {
      const rows = await this.databaseService.query<Organization[]>(
        `SELECT * FROM organizations WHERE id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      const rows = await this.databaseService.query<Organization[]>(
        `SELECT * FROM organizations WHERE slug = $1 LIMIT 1`,
        [slug]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async findByUserId(userId: string): Promise<Array<Organization & { role: string }>> {
    try {
      const rows = await this.databaseService.query<Array<Organization & { role: string }>>(
        `SELECT o.*, om.role
         FROM organizations o
         INNER JOIN organization_memberships om ON o.id = om.organization_id
         WHERE om.user_id = $1 AND om.status = 'ACTIVE'`,
        [userId]
      );
      return rows;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; logo_url: string }>
  ): Promise<Organization> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${i++}`);
        values.push(data.name);
      }
      if (data.slug !== undefined) {
        fields.push(`slug = $${i++}`);
        values.push(data.slug);
      }
      if (data.logo_url !== undefined) {
        fields.push(`logo_url = $${i++}`);
        values.push(data.logo_url);
      }
      
      fields.push(`updated_at = $${i++}`);
      values.push(new Date().toISOString());

      values.push(id); // Where condition

      const query = `UPDATE organizations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
      const rows = await this.databaseService.query<Organization[]>(query, values);
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.databaseService.query(`DELETE FROM organizations WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      handleDatabaseError(error, 'Organization');
    }
  }
}
