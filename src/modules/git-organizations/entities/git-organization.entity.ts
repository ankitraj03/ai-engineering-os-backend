export interface GitOrganization {
  id: string;
  integration_id: string;
  external_id: string;
  name: string | null;
  login: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
