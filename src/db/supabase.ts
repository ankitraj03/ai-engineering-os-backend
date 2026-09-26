import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '../config/supabase.config';

class SupabaseManager {
  private static instance: SupabaseManager;
  private client: SupabaseClient | null = null;
  private adminClient: SupabaseClient | null = null;

  private constructor() {
    this.initClients();
  }

  public static getInstance(): SupabaseManager {
    if (!SupabaseManager.instance) {
      SupabaseManager.instance = new SupabaseManager();
    }
    return SupabaseManager.instance;
  }

  private initClients() {
    const config = getSupabaseConfig();

    if (!config.url) {
      console.warn('[Supabase] Warning: Missing SUPABASE_URL. Supabase client will fail until configured.');
      return;
    }

    const defaultKey = config.publishableKey || config.secretKey;
    if (defaultKey) {
      this.client = createClient(config.url, defaultKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }

    if (config.secretKey) {
      this.adminClient = createClient(config.url, config.secretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } else {
      console.warn(
        '[Supabase] Warning: Missing SUPABASE_SECRET_KEY. Admin/RLS-bypassing client unavailable.'
      );
      this.adminClient = this.client;
    }
  }

  public getClient(accessToken?: string): SupabaseClient {
    const config = getSupabaseConfig();
    if (accessToken && config.url) {
      return createClient(config.url, config.publishableKey || config.secretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      });
    }

    if (!this.client && config.url) {
      this.initClients();
    }

    if (!this.client) {
      throw new Error('Supabase client is not initialized. Please verify SUPABASE_URL and keys.');
    }

    return this.client;
  }

  public getAdminClient(): SupabaseClient {
    if (!this.adminClient) {
      this.initClients();
    }

    if (!this.adminClient) {
      throw new Error(
        'Supabase Admin client is not initialized. Please verify SUPABASE_URL and SUPABASE_SECRET_KEY.'
      );
    }

    return this.adminClient;
  }
}

export const supabaseManager = SupabaseManager.getInstance();
export const getSupabaseClient = (token?: string) => supabaseManager.getClient(token);
export const getSupabaseAdminClient = () => supabaseManager.getAdminClient();
