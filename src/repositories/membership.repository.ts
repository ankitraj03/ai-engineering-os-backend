import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../db/supabase';
import { OrganizationMembership } from '../models/membership.model';
import { MembershipRole, MembershipStatus } from '../models/enums';
import { handleDatabaseError } from '../utils/database-error';

export class OrganizationMembershipsRepository {
  private getClient: () => SupabaseClient;

  constructor(clientProvider?: () => SupabaseClient) {
    this.getClient = clientProvider || (() => getSupabaseAdminClient());
  }

  async create(data: {
    organization_id: string;
    user_id: string;
    role: MembershipRole;
    status?: MembershipStatus;
  }): Promise<OrganizationMembership> {
    const client = this.getClient();
    const { data: membership, error } = await client
      .from('organization_memberships')
      .insert({
        organization_id: data.organization_id,
        user_id: data.user_id,
        role: data.role,
        status: data.status || MembershipStatus.ACTIVE,
        joined_at:
          data.status === MembershipStatus.INVITED
            ? null
            : new Date().toISOString(),
      })
      .select('*, user:users (*)')
      .single();

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return membership as OrganizationMembership;
  }

  async findById(id: string): Promise<OrganizationMembership | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .select('*, user:users (*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return data as OrganizationMembership | null;
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string
  ): Promise<OrganizationMembership | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .select('*, user:users (*)')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return data as OrganizationMembership | null;
  }

  async findByOrganization(
    organizationId: string
  ): Promise<OrganizationMembership[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .select('*, user:users (*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: true });

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return (data || []) as OrganizationMembership[];
  }

  async findByUser(userId: string): Promise<OrganizationMembership[]> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return (data || []) as OrganizationMembership[];
  }

  async updateRole(
    id: string,
    role: MembershipRole
  ): Promise<OrganizationMembership> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, user:users (*)')
      .single();

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return data as OrganizationMembership;
  }

  async updateStatus(
    id: string,
    status: MembershipStatus
  ): Promise<OrganizationMembership> {
    const client = this.getClient();
    const { data, error } = await client
      .from('organization_memberships')
      .update({
        status,
        joined_at:
          status === MembershipStatus.ACTIVE
            ? new Date().toISOString()
            : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, user:users (*)')
      .single();

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return data as OrganizationMembership;
  }

  async countOwners(organizationId: string): Promise<number> {
    const client = this.getClient();
    const { count, error } = await client
      .from('organization_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', MembershipRole.OWNER)
      .eq('status', MembershipStatus.ACTIVE);

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return count || 0;
  }

  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client
      .from('organization_memberships')
      .delete()
      .eq('id', id);

    if (error) {
      handleDatabaseError(error, 'OrganizationMembership');
    }

    return true;
  }
}

export const organizationMembershipsRepository = new OrganizationMembershipsRepository();
