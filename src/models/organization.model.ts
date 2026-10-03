import { MembershipRole } from './enums';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  role?: MembershipRole | string;
  created_at: string;
  updated_at: string;
}
