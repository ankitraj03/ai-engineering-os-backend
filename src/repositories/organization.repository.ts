import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../db/supabase';
import { Organization } from '../models/organization.model';
import { handleDatabaseError } from '../utils/database-error';

export class OrganizationsRepository {
  private getClient: () => SupabaseClient;

  constructor(clientProvider?: () => SupabaseClient) {
    this.getClient = clientProvider || (() => getSupabaseAdminClient());
  }

  async create(data: {
    name: string;
    slug: string;
    logo_url?: string;
  }): Promise<Organization> {
    const client = this.getClient();
    const { data: org, error } = await client
      .from('organizations')
      .insert({
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url || null,
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return org as Organization;
  }

  /**
   * Atomically creates an organization and associates the creator as OWNER
   * using the create_organization_with_owner PostgreSQL RPC function.
   */
  async createWithOwner(
    name: string,
    slug: string,
    logoUrl: string | undefined,
    ownerUserId: string
  ): Promise<{ organization: Organization; membership: any }> {
    const client = this.getClient();
    const { data, error } = await client.rpc('create_organization_with_owner', {
      org_name: name,
      org_slug: slug,
      org_logo_url: logoUrl || null,
      owner_user_id: ownerUserId,
    });

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return {
      organization: data.organization as Organization,
      membership: data.membership,
    };
  }

  async findById(id: string): Promise<Organization | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organizations')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return data as Organization | null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return data as Organization | null;
  }

  async findByUserId(userId: string): Promise<Array<Organization & { role: string }>> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .select('role, organization:organizations (*)')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE');

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    if (!data) return [];

    return data.map((item: any) => ({
      ...(item.organization as Organization),
      role: item.role,
    }));
  }

  async update(
    id: string,
    data: Partial<{ name: string; slug: string; logo_url: string }>
  ): Promise<Organization> {
    const client = this.getClient();
    const { data: org, error } = await client
      .from('organizations')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return org as Organization;
  }

  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('organizations')
      .delete()
      .eq('id', id);

    if (error) {
      handleDatabaseError(error, 'Organization');
    }

    return true;
  }
}

export const organizationsRepository = new OrganizationsRepository();
