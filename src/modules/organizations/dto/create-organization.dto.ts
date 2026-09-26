import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  logo_url?: string;
}
