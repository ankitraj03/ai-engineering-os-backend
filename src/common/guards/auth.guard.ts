import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from '../types/auth-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret',
      });

      const authUser: AuthUser = {
        id: payload.sub,
        email: payload.email,
        fullName: payload.full_name,
        avatarUrl: payload.avatar_url,
        role: payload.role,
      };

      request.user = authUser;
      request.token = token;

      return true;
    } catch (err: unknown) {
      throw new UnauthorizedException('Authentication verification error: Invalid token');
    }
  }
}
