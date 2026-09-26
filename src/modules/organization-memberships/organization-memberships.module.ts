import { Module } from '@nestjs/common';
import { OrganizationMembershipsController } from './controllers/organization-memberships.controller';
import { OrganizationMembershipsService } from './services/organization-memberships.service';
import { OrganizationMembershipsRepository } from './repositories/organization-memberships.repository';

@Module({
  controllers: [OrganizationMembershipsController],
  providers: [
    OrganizationMembershipsService,
    OrganizationMembershipsRepository,
  ],
  exports: [
    OrganizationMembershipsService,
    OrganizationMembershipsRepository,
  ],
})
export class OrganizationMembershipsModule {}
