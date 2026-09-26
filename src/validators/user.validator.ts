import { z } from 'zod';

export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().max(500).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for user ID' }),
});
