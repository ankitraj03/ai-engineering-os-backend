import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { SupabaseModule } from './database/supabase.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { OrganizationMembershipsModule } from './modules/organization-memberships/organization-memberships.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { GitOrganizationsModule } from './modules/git-organizations/git-organizations.module';

@Module({
  imports: [
    // Global environment configuration (.env in backend/ or root)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    // Database connection & TypeORM infrastructure
    DatabaseModule,

    // Centralized Supabase Client
    SupabaseModule,

    // Health check & diagnostic module
    HealthModule,

    // Core Domain Modules
    UsersModule,
    OrganizationsModule,
    OrganizationMembershipsModule,
    IntegrationsModule,
    GitOrganizationsModule,
  ],
})
export class AppModule {}
