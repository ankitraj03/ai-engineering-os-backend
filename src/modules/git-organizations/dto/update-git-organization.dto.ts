import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateGitOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar_url?: string;
}
