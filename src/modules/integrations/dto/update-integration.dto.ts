import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IntegrationStatus } from '../../../common/types/enums';

export class UpdateIntegrationDto {
  @IsOptional()
  @IsEnum(IntegrationStatus, {
    message: 'Status must be one of: ACTIVE, DISCONNECTED, ERROR',
  })
  status?: IntegrationStatus;

  @IsOptional()
  @IsString()
  provider_account_id?: string;
}
