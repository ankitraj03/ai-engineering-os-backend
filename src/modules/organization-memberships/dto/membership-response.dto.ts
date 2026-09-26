import { OrganizationMembership } from '../entities/organization-membership.entity';
import { MembershipRole, MembershipStatus } from '../../../common/types/enums';

export class MembershipResponseDto {
  id: string;
  organization_id: string;
  user_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };

  static fromEntity(
    membership: OrganizationMembership
  ): MembershipResponseDto {
    const dto = new MembershipResponseDto();
    dto.id = membership.id;
    dto.organization_id = membership.organization_id;
    dto.user_id = membership.user_id;
    dto.role = membership.role;
    dto.status = membership.status;
    dto.joined_at = membership.joined_at;
    dto.created_at = membership.created_at;
    dto.updated_at = membership.updated_at;
    if (membership.user) {
      dto.user = {
        id: membership.user.id,
        email: membership.user.email,
        full_name: membership.user.full_name,
        avatar_url: membership.user.avatar_url,
      };
    }
    return dto;
  }
}
