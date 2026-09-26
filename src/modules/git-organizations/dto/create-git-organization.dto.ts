import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateGitOrganizationDto {
  @IsNotEmpty()
  @IsString()
  external_id: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar_url?: string;
}
