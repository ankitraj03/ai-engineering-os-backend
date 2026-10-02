import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { Integration } from '../entities/integration.entity';
import { IntegrationProvider, IntegrationStatus } from '../../../common/types/enums';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class IntegrationsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    organization_id: string;
    provider: IntegrationProvider;
    provider_account_id?: string;
    status?: IntegrationStatus;
  }): Promise<Integration> {
    try {
      const rows = await this.databaseService.query<Integration[]>(
        `INSERT INTO integrations (organization_id, provider, provider_account_id, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          data.organization_id,
          data.provider,
          data.provider_account_id || null,
          data.status || IntegrationStatus.ACTIVE,
        ]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findById(id: string): Promise<Integration | null> {
    try {
      const rows = await this.databaseService.query<Integration[]>(
        `SELECT * FROM integrations WHERE id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findByOrganization(organizationId: string): Promise<Integration[]> {
    try {
      const rows = await this.databaseService.query<Integration[]>(
        `SELECT * FROM integrations WHERE organization_id = $1 ORDER BY created_at DESC`,
        [organizationId]
      );
      return rows;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async findByProvider(
    organizationId: string,
    provider: string
  ): Promise<Integration | null> {
    try {
      const rows = await this.databaseService.query<Integration[]>(
        `SELECT * FROM integrations WHERE organization_id = $1 AND provider = $2 LIMIT 1`,
        [organizationId, provider]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async updateStatus(
    id: string,
    status: IntegrationStatus
  ): Promise<Integration> {
    try {
      const rows = await this.databaseService.query<Integration[]>(
        `UPDATE integrations SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *`,
        [status, new Date().toISOString(), id]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async update(
    id: string,
    data: Partial<{
      status: IntegrationStatus;
      provider_account_id: string;
    }>
  ): Promise<Integration> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (data.status !== undefined) {
        fields.push(`status = $${i++}`);
        values.push(data.status);
      }
      if (data.provider_account_id !== undefined) {
        fields.push(`provider_account_id = $${i++}`);
        values.push(data.provider_account_id);
      }
      
      fields.push(`updated_at = $${i++}`);
      values.push(new Date().toISOString());

      values.push(id); // Where condition

      const query = `UPDATE integrations SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
      const rows = await this.databaseService.query<Integration[]>(query, values);
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.databaseService.query(`DELETE FROM integrations WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      handleDatabaseError(error, 'Integration');
    }
  }
}
