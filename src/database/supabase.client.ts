import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, SupabaseConfig } from '../config/supabase.config';

@Injectable()
export class SupabaseClientService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseClientService.name);
  private readonly config: SupabaseConfig;
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    this.config = getSupabaseConfig();
  }

  onModuleInit() {
    const { url, publishableKey, secretKey } = this.config;

    if (!url) {
      this.logger.error('Cannot initialize Supabase client: SUPABASE_URL is missing.');
      return;
    }

    // Client for standard public operations
    this.client = createClient(url, publishableKey || secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Client with service-role/secret key for trusted backend operations
    if (secretKey) {
      this.adminClient = createClient(url, secretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      this.logger.log('✔ Supabase Admin Client initialized successfully.');
    } else {
      this.adminClient = this.client;
      this.logger.warn(
        'SUPABASE_SECRET_KEY / SERVICE_ROLE_KEY not set. Falling back to public client.'
      );
    }
  }

  /**
   * Returns the standard Supabase client
   */
  getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Returns the privileged admin client using secret / service-role key
   */
  getAdminClient(): SupabaseClient {
    return this.adminClient || this.client;
  }

  /**
   * Creates a client scoped to an authenticated user's JWT for RLS evaluation
   */
  getClientWithAuth(token: string): SupabaseClient {
    return createClient(this.config.url, this.config.publishableKey || this.config.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
}
