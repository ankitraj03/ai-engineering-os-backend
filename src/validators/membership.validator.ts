import { z } from 'zod';
import { MembershipRole, MembershipStatus } from '../models/enums';

export const addMemberSchema = z.object({
  user_id: z.string().uuid({ message: 'Valid user UUID is required' }),
  role: z.nativeEnum(MembershipRole).optional().default(MembershipRole.MEMBER),
});

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(MembershipRole, {
    message: 'Role must be OWNER, ADMIN, or MEMBER',
  }),
});

export const updateMemberStatusSchema = z.object({
  status: z.nativeEnum(MembershipStatus, {
    message: 'Status must be ACTIVE, INVITED, or SUSPENDED',
  }),
});

export const memberParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid UUID format for organization ID' }),
  memberId: z.string().uuid({ message: 'Invalid UUID format for member ID' }),
});
