import { Repository } from 'typeorm';
import { getDataSource } from '../db/data-source';
import { UserEntity } from '../entities/user.entity';
import { User } from '../models/user.model';
import { handleDatabaseError } from '../utils/database-error';
import { NotFoundError } from '../utils/app-error';
import { randomUUID } from 'crypto';

export class UsersRepository {
  private get repo(): Repository<UserEntity> {
    return getDataSource().getRepository(UserEntity);
  }

  private mapEntityToModel(entity: UserEntity): User & { password_hash?: string | null } {
    return {
      id: entity.id,
      email: entity.email,
      full_name: entity.full_name,
      avatar_url: entity.avatar_url,
      created_at: entity.created_at instanceof Date ? entity.created_at.toISOString() : String(entity.created_at),
      updated_at: entity.updated_at instanceof Date ? entity.updated_at.toISOString() : String(entity.updated_at),
      password_hash: entity.password_hash,
    };
  }

  async create(userData: {
    id?: string;
    email: string;
    password?: string;
    password_hash?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    timezone?: string;
  }): Promise<User> {
    try {
      const newUser = this.repo.create({
        id: userData.id || randomUUID(),
        email: userData.email,
        password_hash: userData.password_hash || userData.password || null,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        bio: userData.bio || null,
        timezone: userData.timezone || 'UTC',
      });

      const saved = await this.repo.save(newUser);
      return this.mapEntityToModel(saved);
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.repo.findOneBy({ id });
      return user ? this.mapEntityToModel(user) : null;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.repo.findOneBy({ email });
      return user ? this.mapEntityToModel(user) : null;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async update(
    id: string,
    updateData: Partial<{ full_name: string; avatar_url: string; bio: string; timezone: string }>
  ): Promise<User> {
    try {
      const existing = await this.repo.findOneBy({ id });
      if (!existing) {
        throw new NotFoundError(`User with ID "${id}" not found`);
      }

      await this.repo.update(id, {
        ...(updateData.full_name !== undefined ? { full_name: updateData.full_name } : {}),
        ...(updateData.avatar_url !== undefined ? { avatar_url: updateData.avatar_url } : {}),
        ...(updateData.bio !== undefined ? { bio: updateData.bio } : {}),
        ...(updateData.timezone !== undefined ? { timezone: updateData.timezone } : {}),
      });

      const updated = await this.repo.findOneBy({ id });
      return this.mapEntityToModel(updated!);
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async upsert(userData: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    try {
      await this.repo.upsert(
        {
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name || null,
          avatar_url: userData.avatar_url || null,
        },
        ['id']
      );

      const user = await this.repo.findOneBy({ id: userData.id });
      return this.mapEntityToModel(user!);
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);
      return (result.affected ?? 0) > 0;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }
}

export const usersRepository = new UsersRepository();
