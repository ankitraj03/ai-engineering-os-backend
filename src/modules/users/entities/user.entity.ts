export interface User {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}
