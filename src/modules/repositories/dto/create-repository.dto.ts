import { IsString, IsUrl } from 'class-validator';

export class CreateRepositoryDto {
  @IsUrl()
  url: string;

  @IsString()
  name: string;
}
