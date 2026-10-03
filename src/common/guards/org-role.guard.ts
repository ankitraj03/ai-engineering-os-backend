import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { MembershipRole } from '../types/enums';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OrgRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<MembershipRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const organizationId =
      request.params.organizationId ||
      request.params.id ||
      request.body?.organization_id;

    if (!organizationId) {
      // If endpoint doesn't specify organizationId, allow and let service check
      return true;
    }

    try {
      const rows = await this.databaseService.query<any[]>(
        `SELECT role, status FROM organization_memberships
         WHERE organization_id = $1 AND user_id = $2 AND status = 'ACTIVE' LIMIT 1`,
        [organizationId, user.id]
      );
      
      const membership = rows[0];

      if (!membership) {
        throw new ForbiddenException(
          'You do not have an active membership in this organization'
        );
      }

      const hasRole = requiredRoles.includes(membership.role as MembershipRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `Insufficient permissions. Required role: [${requiredRoles.join(', ')}]. Current role: ${membership.role}`
        );
      }

      request.membership = membership;
      return true;
    } catch (error: any) {
      if (error instanceof ForbiddenException) throw error;
      throw new ForbiddenException('Error verifying organization role');
    }
  }
}
