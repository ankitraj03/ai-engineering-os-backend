import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { MembershipRole, MembershipStatus } from '../../../common/types/enums';

export class AddMemberDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  @IsEnum(MembershipRole, {
    message: 'Role must be one of: OWNER, ADMIN, MEMBER',
  })
  role: MembershipRole;

  @IsOptional()
  @IsEnum(MembershipStatus, {
    message: 'Status must be one of: ACTIVE, INVITED, SUSPENDED',
  })
  status?: MembershipStatus;
}
