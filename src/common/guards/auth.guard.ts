import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClientService } from '../../database/supabase.client';
import { AuthUser } from '../types/auth-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseClientService: SupabaseClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header. Expected Bearer <token>.'
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const client = this.supabaseClientService.getClient();
      const { data, error } = await client.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException(
          `Authentication failed: ${error?.message || 'User not found'}`
        );
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || '',
        fullName:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          undefined,
        avatarUrl: data.user.user_metadata?.avatar_url || undefined,
        role: data.user.role,
      };

      request.user = authUser;
      request.token = token;

      return true;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      const error = err as Error;
      throw new UnauthorizedException(
        `Authentication verification error: ${error.message}`
      );
    }
  }
}
