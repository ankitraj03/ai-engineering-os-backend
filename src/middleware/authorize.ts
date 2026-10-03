import { Request, Response, NextFunction } from 'express';
import { MembershipRole, MembershipStatus } from '../models/enums';
import { ForbiddenError } from '../utils/app-error';
import { organizationMembershipsRepository } from '../repositories/membership.repository';

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
      const membership = await organizationMembershipsRepository.findByUserAndOrganization(
        user.id,
        organizationId
      );

      if (!membership || membership.status !== MembershipStatus.ACTIVE) {
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
