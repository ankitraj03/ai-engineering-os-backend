import { z } from 'zod';

export const createGitOrganizationSchema = z.object({
  external_id: z.string().min(1, 'External ID is required'),
  login: z.string().min(1, 'Login handle is required'),
  name: z.string().max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
});

export const updateGitOrganizationSchema = z.object({
  name: z.string().max(100).optional(),
  login: z.string().min(1).optional(),
  avatar_url: z.string().url().max(500).optional(),
});

export const gitOrgIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for git organization ID' }),
});
