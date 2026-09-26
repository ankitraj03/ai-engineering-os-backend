import { Injectable } from '@nestjs/common';
import { SupabaseClientService } from '../../../database/supabase.client';
import { User } from '../entities/user.entity';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseClientService: SupabaseClientService) {}

  async create(userData: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const client = this.supabaseClientService.getAdminClient();
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
    const client = this.supabaseClientService.getAdminClient();
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
    const client = this.supabaseClientService.getAdminClient();
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
    const client = this.supabaseClientService.getAdminClient();
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
    const client = this.supabaseClientService.getAdminClient();
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
    const client = this.supabaseClientService.getAdminClient();
    const { error } = await client.from('users').delete().eq('id', id);

    if (error) {
      handleDatabaseError(error, 'User');
    }

    return true;
  }
}
