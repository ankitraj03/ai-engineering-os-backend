import { IntegrationProvider, IntegrationStatus } from '../../../common/types/enums';

export interface Integration {
  id: string;
  organization_id: string;
  provider: IntegrationProvider;
  provider_account_id: string | null;
  status: IntegrationStatus;
  created_at: string;
  updated_at: string;
}
