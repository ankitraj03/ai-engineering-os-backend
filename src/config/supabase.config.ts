export interface SupabaseConfig {
  url: string;
  publishableKey: string;
  secretKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL || '';
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    '';
  const secretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    '';

  if (!url) {
    // Log a warning if URL is missing
    console.warn(
      '[SupabaseConfig] Warning: SUPABASE_URL is not set in environment variables.'
    );
  }

  return {
    url,
    publishableKey,
    secretKey,
  };
};
