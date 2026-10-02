import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repositories/users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService
  ) {}

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: 'USER', // Assign default role or fetch from db
    };
    return this.jwtService.signAsync(payload);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.password_hash !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password_hash, ...userWithoutPassword } = user;
    return {
      message: 'Login successful',
      user: userWithoutPassword,
      access_token: await this.generateToken(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const newUser = await this.usersRepository.create({
      id: randomUUID(),
      email: registerDto.email,
      password: registerDto.password,
      full_name: registerDto.full_name,
      avatar_url: registerDto.avatar_url,
      bio: registerDto.bio,
      timezone: registerDto.timezone,
    });

    const { password_hash, ...userWithoutPassword } = newUser;
    return {
      message: 'Registration successful',
      user: userWithoutPassword,
      access_token: await this.generateToken(newUser),
    };
  }
}
