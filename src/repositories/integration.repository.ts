import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../db/supabase';
import { Integration } from '../models/integration.model';
import { IntegrationProvider, IntegrationStatus } from '../models/enums';
import { handleDatabaseError } from '../utils/database-error';

export class IntegrationsRepository {
  private getClient: () => SupabaseClient;

  constructor(clientProvider?: () => SupabaseClient) {
    this.getClient = clientProvider || (() => getSupabaseAdminClient());
  }

  async create(data: {
    organization_id: string;
    provider: IntegrationProvider;
    provider_account_id?: string;
    status?: IntegrationStatus;
  }): Promise<Integration> {
    const client = this.getClient();
    const { data: integration, error } = await client
      .from('integrations')
      .insert({
        organization_id: data.organization_id,
        provider: data.provider,
        provider_account_id: data.provider_account_id || null,
        status: data.status || IntegrationStatus.ACTIVE,
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return integration as Integration;
  }

  async findById(id: string): Promise<Integration | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('integrations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return data as Integration | null;
  }

  async findByOrganization(organizationId: string): Promise<Integration[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return (data || []) as Integration[];
  }

  async findByProvider(
    organizationId: string,
    provider: string
  ): Promise<Integration | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('integrations')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('provider', provider)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return data as Integration | null;
  }

  async updateStatus(
    id: string,
    status: IntegrationStatus
  ): Promise<Integration> {
    const client = this.getClient();
    const { data, error } = await client
      .from('integrations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return data as Integration;
  }

  async update(
    id: string,
    data: Partial<{
      status: IntegrationStatus;
      provider_account_id: string;
    }>
  ): Promise<Integration> {
    const client = this.getClient();
    const { data: updated, error } = await client
      .from('integrations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return updated as Integration;
  }

  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('integrations')
      .delete()
      .eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Integration');
    }

    return true;
  }
}

export const integrationsRepository = new IntegrationsRepository();
