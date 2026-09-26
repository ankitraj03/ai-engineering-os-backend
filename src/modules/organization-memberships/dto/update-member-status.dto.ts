import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembershipStatus } from '../../../common/types/enums';

export class UpdateMemberStatusDto {
  @IsNotEmpty()
  @IsEnum(MembershipStatus, {
    message: 'Status must be one of: ACTIVE, INVITED, SUSPENDED',
  })
  status: MembershipStatus;
}
