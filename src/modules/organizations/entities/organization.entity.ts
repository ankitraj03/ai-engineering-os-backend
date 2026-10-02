export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: string | null;
  created_at: string;
  updated_at: string;
}
