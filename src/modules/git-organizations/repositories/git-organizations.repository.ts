import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../database/supabase.client';
import { GitOrganization } from '../entities/git-organization.entity';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class GitOrganizationsRepository {
  constructor(private readonly supabaseClientService: SupabaseClientService) {}

  async create(data: {
    integration_id: string;
    external_id: string;
    name?: string;
    login: string;
    avatar_url?: string;
  }): Promise<GitOrganization> {
    const client = this.supabaseClientService.getAdminClient();
    const { data: gitOrg, error } = await client
      .from('git_organizations')
      .insert({
        integration_id: data.integration_id,
        external_id: data.external_id,
        name: data.name || null,
        login: data.login,
        avatar_url: data.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return gitOrg as GitOrganization;
  }

  async findById(id: string): Promise<GitOrganization | null> {
    const client = this.supabaseClientService.getAdminClient();
    const { data, error } = await client
      .from('git_organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return data as GitOrganization | null;
  }

  async findByIntegration(
    integrationId: string
  ): Promise<GitOrganization[]> {
    const client = this.supabaseClientService.getAdminClient();
    const { data, error } = await client
      .from('git_organizations')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: true });

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return (data || []) as GitOrganization[];
  }

  async findByExternalId(
    integrationId: string,
    externalId: string
  ): Promise<GitOrganization | null> {
    const client = this.supabaseClientService.getAdminClient();
    const { data, error } = await client
      .from('git_organizations')
      .select('*')
      .eq('integration_id', integrationId)
      .eq('external_id', externalId)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return data as GitOrganization | null;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      login: string;
      avatar_url: string;
    }>
  ): Promise<GitOrganization> {
    const client = this.supabaseClientService.getAdminClient();
    const { data: updated, error } = await client
      .from('git_organizations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return updated as GitOrganization;
  }

  async delete(id: string): Promise<boolean> {
    const client = this.supabaseClientService.getAdminClient();
    const { error } = await client
      .from('git_organizations')
      .delete()
      .eq('id', id);

    if (error) {
      handleDatabaseError(error, 'GitOrganization');
    }

    return true;
  }
}
