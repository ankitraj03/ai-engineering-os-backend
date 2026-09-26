import { Module } from '@nestjs/common';
import { GitOrganizationsController } from './controllers/git-organizations.controller';
import { GitOrganizationsService } from './services/git-organizations.service';
import { GitOrganizationsRepository } from './repositories/git-organizations.repository';

@Module({
  controllers: [GitOrganizationsController],
  providers: [GitOrganizationsService, GitOrganizationsRepository],
  exports: [GitOrganizationsService, GitOrganizationsRepository],
})
export class GitOrganizationsModule {}
