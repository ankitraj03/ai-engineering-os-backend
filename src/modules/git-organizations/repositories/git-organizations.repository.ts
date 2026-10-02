import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { GitOrganization } from '../entities/git-organization.entity';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class GitOrganizationsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    integration_id: string;
    external_id: string;
    name?: string;
    login: string;
    avatar_url?: string;
  }): Promise<GitOrganization> {
    try {
      const rows = await this.databaseService.query<GitOrganization[]>(
        `INSERT INTO git_organizations (integration_id, external_id, name, login, avatar_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          data.integration_id,
          data.external_id,
          data.name || null,
          data.login,
          data.avatar_url || null,
        ]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findById(id: string): Promise<GitOrganization | null> {
    try {
      const rows = await this.databaseService.query<GitOrganization[]>(
        `SELECT * FROM git_organizations WHERE id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findByIntegration(
    integrationId: string
  ): Promise<GitOrganization[]> {
    try {
      const rows = await this.databaseService.query<GitOrganization[]>(
        `SELECT * FROM git_organizations WHERE integration_id = $1 ORDER BY created_at ASC`,
        [integrationId]
      );
      return rows;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async findByExternalId(
    integrationId: string,
    externalId: string
  ): Promise<GitOrganization | null> {
    try {
      const rows = await this.databaseService.query<GitOrganization[]>(
        `SELECT * FROM git_organizations WHERE integration_id = $1 AND external_id = $2 LIMIT 1`,
        [integrationId, externalId]
      );
      return rows[0] || null;
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
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (data.name !== undefined) {
        fields.push(`name = $${i++}`);
        values.push(data.name);
      }
      if (data.login !== undefined) {
        fields.push(`login = $${i++}`);
        values.push(data.login);
      }
      if (data.avatar_url !== undefined) {
        fields.push(`avatar_url = $${i++}`);
        values.push(data.avatar_url);
      }
      
      fields.push(`updated_at = $${i++}`);
      values.push(new Date().toISOString());

      values.push(id); // Where condition

      const query = `UPDATE git_organizations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
      const rows = await this.databaseService.query<GitOrganization[]>(query, values);
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.databaseService.query(`DELETE FROM git_organizations WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      handleDatabaseError(error, 'GitOrganization');
    }
  }
}
