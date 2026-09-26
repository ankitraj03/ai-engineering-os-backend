import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must not exceed 50 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with single hyphens'),
  logo_url: z.string().url().max(500).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lower-case alphanumeric with single hyphens')
    .optional(),
  logo_url: z.string().url().max(500).optional(),
});

export const orgIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for organization ID' }),
});
