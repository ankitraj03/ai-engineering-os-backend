import { Organization } from '../entities/organization.entity';

export class OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  role?: string;

  static fromEntity(org: Organization, role?: string): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    dto.id = org.id;
    dto.name = org.name;
    dto.slug = org.slug;
    dto.logo_url = org.logo_url;
    dto.created_at = org.created_at;
    dto.updated_at = org.updated_at;
    dto.role = role;
    return dto;
  }
}
