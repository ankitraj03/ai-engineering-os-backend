import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { User } from '../entities/user.entity';
import { handleDatabaseError } from '../../../common/errors/database-error.util';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(userData: {
    id: string;
    email: string;
    password?: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    timezone?: string;
  }): Promise<User> {
    try {
      const rows = await this.databaseService.query<User[]>(
        `INSERT INTO users (id, email, password_hash, full_name, avatar_url, bio, timezone)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          userData.id,
          userData.email,
          userData.password || null,
          userData.full_name || null,
          userData.avatar_url || null,
          userData.bio || null,
          userData.timezone || null,
        ]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const rows = await this.databaseService.query<User[]>(
        `SELECT * FROM users WHERE id = $1 LIMIT 1`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const rows = await this.databaseService.query<User[]>(
        `SELECT * FROM users WHERE email = $1 LIMIT 1`,
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async update(
    id: string,
    updateData: Partial<{ full_name: string; avatar_url: string }>
  ): Promise<User> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let i = 1;

      if (updateData.full_name !== undefined) {
        fields.push(`full_name = $${i++}`);
        values.push(updateData.full_name);
      }
      if (updateData.avatar_url !== undefined) {
        fields.push(`avatar_url = $${i++}`);
        values.push(updateData.avatar_url);
      }
      
      fields.push(`updated_at = $${i++}`);
      values.push(new Date().toISOString());

      values.push(id); // Where condition

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
      const rows = await this.databaseService.query<User[]>(query, values);
      return rows[0];
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
      const rows = await this.databaseService.query<User[]>(
        `INSERT INTO users (id, email, full_name, avatar_url, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           full_name = EXCLUDED.full_name,
           avatar_url = EXCLUDED.avatar_url,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [
          userData.id,
          userData.email,
          userData.full_name || null,
          userData.avatar_url || null,
          new Date().toISOString()
        ]
      );
      return rows[0];
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.databaseService.query(`DELETE FROM users WHERE id = $1`, [id]);
      return true;
    } catch (error) {
      handleDatabaseError(error, 'User');
    }
  }
}
