import { GitOrganization } from '../entities/git-organization.entity';

export class GitOrganizationResponseDto {
  id: string;
  integration_id: string;
  external_id: string;
  name: string | null;
  login: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;

  static fromEntity(
    gitOrg: GitOrganization
  ): GitOrganizationResponseDto {
    const dto = new GitOrganizationResponseDto();
    dto.id = gitOrg.id;
    dto.integration_id = gitOrg.integration_id;
    dto.external_id = gitOrg.external_id;
    dto.name = gitOrg.name;
    dto.login = gitOrg.login;
    dto.avatar_url = gitOrg.avatar_url;
    dto.created_at = gitOrg.created_at;
    dto.updated_at = gitOrg.updated_at;
    return dto;
  }
}
