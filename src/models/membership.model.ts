import { MembershipRole, MembershipStatus } from './enums';
import { UserResponse } from './user.model';

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipResponse {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: UserResponse;
}
