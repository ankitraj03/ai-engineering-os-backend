import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from backend root or parent directory
dotenv.config({ path: [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '../.env')] });

export interface AppConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  databaseUrl: string;
  supabaseUrl: string;
  supabaseSecretKey: string;
  supabasePublishableKey?: string;
  supabaseJwksUrl?: string;
}

export const envConfig: AppConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY,
  supabaseJwksUrl: process.env.SUPABASE_JWKS_URL,
};
