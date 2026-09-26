import { MembershipRole, MembershipStatus } from '../../../common/types/enums';
import { User } from '../../users/entities/user.entity';

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}
