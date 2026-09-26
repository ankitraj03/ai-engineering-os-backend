import { UsersRepository, usersRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { NotFoundError } from '../utils/app-error';

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  async getProfile(userId: string): Promise<User> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateData: { full_name?: string; avatar_url?: string }
  ): Promise<User> {
    const existing = await this.repo.findById(userId);
    if (!existing) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }

    return this.repo.update(userId, {
      full_name: updateData.full_name,
      avatar_url: updateData.avatar_url,
    });
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID "${userId}" not found`);
    }
    return user;
  }
}

export const usersService = new UsersService();
