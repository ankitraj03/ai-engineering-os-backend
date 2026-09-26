import { Integration } from '../entities/integration.entity';
import { IntegrationProvider, IntegrationStatus } from '../../../common/types/enums';

export class IntegrationResponseDto {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  provider_account_id: string | null;
  status: IntegrationStatus;
  created_at: string;
  updated_at: string;

  static fromEntity(integration: Integration): IntegrationResponseDto {
    const dto = new IntegrationResponseDto();
    dto.id = integration.id;
    dto.organization_id = integration.organization_id;
    dto.provider = integration.provider;
    dto.provider_account_id = integration.provider_account_id;
    dto.status = integration.status;
    dto.created_at = integration.created_at;
    dto.updated_at = integration.updated_at;
    return dto;
  }
}
