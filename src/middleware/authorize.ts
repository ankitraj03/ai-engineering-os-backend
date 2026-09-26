import { Request, Response, NextFunction } from 'express';
import { MembershipRole } from '../models/enums';
import { ForbiddenError } from '../utils/app-error';
import { getSupabaseAdminClient } from '../db/supabase';

export function authorizeOrgRole(...requiredRoles: MembershipRole[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return next();
    }

    const user = req.user;
    if (!user) {
      return next(new ForbiddenError('User is not authenticated'));
    }

    const organizationId =
      req.params.organizationId ||
      req.params.id ||
      req.body?.organization_id;

    if (!organizationId) {
      // If endpoint doesn't specify organizationId, allow and let service handle
      return next();
    }

    try {
      const client = getSupabaseAdminClient();
      const { data: membership, error } = await client
        .from('organization_memberships')
        .select('role, status')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      if (error || !membership) {
        return next(
          new ForbiddenError(
            'You do not have an active membership in this organization'
          )
        );
      }

      const hasRole = requiredRoles.includes(membership.role as MembershipRole);
      if (!hasRole) {
        return next(
          new ForbiddenError(
            `Insufficient permissions. Required role: [${requiredRoles.join(', ')}]. Current role: ${membership.role}`
          )
        );
      }

      req.membership = membership;
      next();
    } catch (err: unknown) {
      next(err);
    }
  };
}
