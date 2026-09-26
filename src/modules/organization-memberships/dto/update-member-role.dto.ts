import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembershipRole } from '../../../common/types/enums';

export class UpdateMemberRoleDto {
  @IsNotEmpty()
  @IsEnum(MembershipRole, {
    message: 'Role must be one of: OWNER, ADMIN, MEMBER',
  })
  role: MembershipRole;
}
