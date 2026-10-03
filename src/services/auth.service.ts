import { createHmac, randomUUID } from 'crypto';
import { UsersRepository, usersRepository } from '../repositories/user.repository';
import { LoginInput, RegisterInput } from '../validators/auth.validator';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/app-error';

export function generateAccessToken(payload: Record<string, any>): string {
  const secret = process.env.JWT_SECRET || 'super-secret';
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + 86400, // 24 hours
  };

  const toBase64Url = (obj: Record<string, any>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const encodedHeader = toBase64Url(header);
  const encodedPayload = toBase64Url(fullPayload);
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyAccessToken(token: string): Record<string, any> {
  const secret = process.env.JWT_SECRET || 'super-secret';
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new UnauthorizedError('Invalid token structure');
  }

  const [header, payload, signature] = parts;
  const expectedSig = createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  if (signature !== expectedSig) {
    throw new UnauthorizedError('Invalid token signature');
  }

  try {
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new UnauthorizedError('Token has expired');
    }
    return decodedPayload;
  } catch (err: unknown) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Malformed token payload');
  }
}

export class AuthService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  async login(input: LoginInput) {
    // Local PostgreSQL database lookup
    const user = await this.repo.findByEmail(input.email);

    if (user && user.password_hash === input.password) {
      const { password_hash, ...userWithoutPassword } = user;
      const token = generateAccessToken({
        sub: user.id,
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: 'USER',
      });

      return {
        message: 'Login successful',
        user: userWithoutPassword,
        token,
        access_token: token,
      };
    }

    throw new UnauthorizedError('Invalid credentials');
  }

  async register(input: RegisterInput) {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const newUser = await this.repo.create({
      id: randomUUID(),
      email: input.email,
      password_hash: input.password,
      full_name: input.full_name,
      avatar_url: input.avatar_url,
      bio: input.bio,
      timezone: input.timezone,
    });

    const { password_hash, ...userWithoutPassword } = newUser;
    const token = generateAccessToken({
      sub: newUser.id,
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      avatar_url: newUser.avatar_url,
      role: 'USER',
    });

    return {
      message: 'Registration successful',
      user: userWithoutPassword,
      token,
      access_token: token,
    };
  }

  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
