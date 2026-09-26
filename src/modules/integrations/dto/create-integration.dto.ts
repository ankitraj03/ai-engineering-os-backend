import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IntegrationProvider, IntegrationStatus } from '../../../common/types/enums';

export class CreateIntegrationDto {
  @IsNotEmpty()
  @IsEnum(IntegrationProvider, {
    message: 'Provider must be one of: GITHUB, GITLAB, BITBUCKET, JIRA, SLACK',
  })
  provider: IntegrationProvider;

  @IsOptional()
  @IsString()
  provider_account_id?: string;

  @IsOptional()
  @IsEnum(IntegrationStatus, {
    message: 'Status must be one of: ACTIVE, DISCONNECTED, ERROR',
  })
  status?: IntegrationStatus;
}
