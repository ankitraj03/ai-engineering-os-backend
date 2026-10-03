import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../models/auth-user.model';
import { UnauthorizedError } from '../utils/app-error';
import { verifyAccessToken } from '../services/auth.service';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new UnauthorizedError(
        'Missing or malformed Authorization header. Expected Bearer <token>.'
      )
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);

    const authUser: AuthUser = {
      id: payload.sub || payload.id,
      email: payload.email || '',
      fullName: payload.full_name || payload.name || undefined,
      avatarUrl: payload.avatar_url || undefined,
      role: payload.role || 'USER',
    };

    req.user = authUser;
    req.token = token;
    return next();
  } catch (err: unknown) {
    const error = err as Error;
    return next(
      new UnauthorizedError(`Authentication verification error: ${error.message}`)
    );
  }
}
