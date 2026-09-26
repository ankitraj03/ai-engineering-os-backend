import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdminClient } from '../db/supabase';
import { AuthUser } from '../models/auth-user.model';
import { UnauthorizedError } from '../utils/app-error';

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
    const client = getSupabaseAdminClient();
    const { data, error } = await client.auth.getUser(token);

    if (error || !data.user) {
      return next(
        new UnauthorizedError(
          `Authentication failed: ${error?.message || 'User not found'}`
        )
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

    req.user = authUser;
    req.token = token;

    next();
  } catch (err: unknown) {
    const error = err as Error;
    return next(
      new UnauthorizedError(`Authentication verification error: ${error.message}`)
    );
  }
}
