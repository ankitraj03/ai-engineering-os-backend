import { z } from 'zod';
import { IntegrationProvider, IntegrationStatus } from '../models/enums';

export const createIntegrationSchema = z.object({
  provider: z.nativeEnum(IntegrationProvider, {
    message: 'Provider must be GITHUB, GITLAB, BITBUCKET, JIRA, or SLACK',
  }),
  provider_account_id: z.string().max(255).optional(),
});

export const updateIntegrationSchema = z.object({
  status: z.nativeEnum(IntegrationStatus, {
    message: 'Status must be ACTIVE, DISCONNECTED, or ERROR',
  }),
});

export const integrationIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for integration ID' }),
});
