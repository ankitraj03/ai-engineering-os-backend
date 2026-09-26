import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthUser } from '../../../common/types/auth-user.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(authUser: AuthUser): Promise<User> {
    let user = await this.usersRepository.findById(authUser.id);

    // If user record doesn't exist yet in public.users, sync from Auth context
    if (!user) {
      user = await this.usersRepository.upsert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.fullName,
        avatar_url: authUser.avatarUrl,
      });
    }

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    const existing = await this.usersRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    return this.usersRepository.update(userId, {
      full_name: dto.full_name,
      avatar_url: dto.avatar_url,
    });
  }

  async syncUser(authUser: AuthUser): Promise<User> {
    return this.usersRepository.upsert({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.fullName,
      avatar_url: authUser.avatarUrl,
    });
  }
}
