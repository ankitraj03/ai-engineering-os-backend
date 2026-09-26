import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from '../db/supabase';
import { User } from '../models/user.model';
import { handleDatabaseError } from '../utils/database-error';

export class UsersRepository {
  private getClient: () => SupabaseClient;

  constructor(clientProvider?: () => SupabaseClient) {
    this.getClient = clientProvider || (() => getSupabaseAdminClient());
  }

  async create(userData: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return data as User;
  }

  async findById(id: string): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return data as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return data as User | null;
  }

  async update(
    id: string,
    updateData: Partial<{ full_name: string; avatar_url: string }>
  ): Promise<User> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return data as User;
  }

  async upsert(userData: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const client = this.getClient();
    const { data, error } = await client
      .from('users')
      .upsert({
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return data as User;
  }

  async delete(id: string): Promise<boolean> {
    const client = this.getClient();
    const { error } = await client.from('users').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return true;
  }
}

export const usersRepository = new UsersRepository();
