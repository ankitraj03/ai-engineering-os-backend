import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.full_name = user.full_name;
    dto.avatar_url = user.avatar_url;
    dto.created_at = user.created_at;
    dto.updated_at = user.updated_at;
    return dto;
  }
}
