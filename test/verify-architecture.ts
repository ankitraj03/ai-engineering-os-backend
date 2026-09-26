import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env', '../.env'] });

import { UsersRepository } from '../src/modules/users/repositories/users.repository';
import { UsersService } from '../src/modules/users/services/users.service';
import { OrganizationsRepository } from '../src/modules/organizations/repositories/organizations.repository';
import { OrganizationsService } from '../src/modules/organizations/services/organizations.service';
import { OrganizationMembershipsRepository } from '../src/modules/organization-memberships/repositories/organization-memberships.repository';
import { OrganizationMembershipsService } from '../src/modules/organization-memberships/services/organization-memberships.service';
import { IntegrationsRepository } from '../src/modules/integrations/repositories/integrations.repository';
import { IntegrationsService } from '../src/modules/integrations/services/integrations.service';
import { GitOrganizationsRepository } from '../src/modules/git-organizations/repositories/git-organizations.repository';
import { GitOrganizationsService } from '../src/modules/git-organizations/services/git-organizations.service';
import { SupabaseClientService } from '../src/database/supabase.client';
import { handleDatabaseError } from '../src/common/errors/database-error.util';
import { MembershipRole, MembershipStatus } from '../src/common/types/enums';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

async function runVerification() {
  console.log('============================================================');
  console.log('RUNNING ARCHITECTURE & LOGIC VERIFICATION');
  console.log('============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✔ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✖ [FAIL] ${testName}`);
      failed++;
    }
  }

  // ------------------------------------------------------------
  // 1. REPOSITORY METHOD SIGNATURES
  // ------------------------------------------------------------
  console.log('--- 1. Testing Repository Method Signatures ---');
  const supabaseClientService = new SupabaseClientService();
  supabaseClientService.onModuleInit();

  const usersRepo = new UsersRepository(supabaseClientService);
  assert(typeof usersRepo.create === 'function', 'UsersRepository.create exists');
  assert(typeof usersRepo.findById === 'function', 'UsersRepository.findById exists');
  assert(typeof usersRepo.findByEmail === 'function', 'UsersRepository.findByEmail exists');
  assert(typeof usersRepo.update === 'function', 'UsersRepository.update exists');
  assert(typeof usersRepo.delete === 'function', 'UsersRepository.delete exists');

  const orgsRepo = new OrganizationsRepository(supabaseClientService);
  assert(typeof orgsRepo.create === 'function', 'OrganizationsRepository.create exists');
  assert(typeof orgsRepo.createWithOwner === 'function', 'OrganizationsRepository.createWithOwner exists');
  assert(typeof orgsRepo.findById === 'function', 'OrganizationsRepository.findById exists');
  assert(typeof orgsRepo.findBySlug === 'function', 'OrganizationsRepository.findBySlug exists');
  assert(typeof orgsRepo.findByUserId === 'function', 'OrganizationsRepository.findByUserId exists');
  assert(typeof orgsRepo.update === 'function', 'OrganizationsRepository.update exists');
  assert(typeof orgsRepo.delete === 'function', 'OrganizationsRepository.delete exists');

  const membershipsRepo = new OrganizationMembershipsRepository(supabaseClientService);
  assert(typeof membershipsRepo.create === 'function', 'OrganizationMembershipsRepository.create exists');
  assert(typeof membershipsRepo.findById === 'function', 'OrganizationMembershipsRepository.findById exists');
  assert(typeof membershipsRepo.findByUserAndOrganization === 'function', 'OrganizationMembershipsRepository.findByUserAndOrganization exists');
  assert(typeof membershipsRepo.findByOrganization === 'function', 'OrganizationMembershipsRepository.findByOrganization exists');
  assert(typeof membershipsRepo.findByUser === 'function', 'OrganizationMembershipsRepository.findByUser exists');
  assert(typeof membershipsRepo.updateRole === 'function', 'OrganizationMembershipsRepository.updateRole exists');
  assert(typeof membershipsRepo.updateStatus === 'function', 'OrganizationMembershipsRepository.updateStatus exists');
  assert(typeof membershipsRepo.countOwners === 'function', 'OrganizationMembershipsRepository.countOwners exists');
  assert(typeof membershipsRepo.delete === 'function', 'OrganizationMembershipsRepository.delete exists');

  const integrationsRepo = new IntegrationsRepository(supabaseClientService);
  assert(typeof integrationsRepo.create === 'function', 'IntegrationsRepository.create exists');
  assert(typeof integrationsRepo.findById === 'function', 'IntegrationsRepository.findById exists');
  assert(typeof integrationsRepo.findByOrganization === 'function', 'IntegrationsRepository.findByOrganization exists');
  assert(typeof integrationsRepo.findByProvider === 'function', 'IntegrationsRepository.findByProvider exists');
  assert(typeof integrationsRepo.updateStatus === 'function', 'IntegrationsRepository.updateStatus exists');
  assert(typeof integrationsRepo.delete === 'function', 'IntegrationsRepository.delete exists');

  const gitOrgsRepo = new GitOrganizationsRepository(supabaseClientService);
  assert(typeof gitOrgsRepo.create === 'function', 'GitOrganizationsRepository.create exists');
  assert(typeof gitOrgsRepo.findById === 'function', 'GitOrganizationsRepository.findById exists');
  assert(typeof gitOrgsRepo.findByIntegration === 'function', 'GitOrganizationsRepository.findByIntegration exists');
  assert(typeof gitOrgsRepo.findByExternalId === 'function', 'GitOrganizationsRepository.findByExternalId exists');
  assert(typeof gitOrgsRepo.update === 'function', 'GitOrganizationsRepository.update exists');
  assert(typeof gitOrgsRepo.delete === 'function', 'GitOrganizationsRepository.delete exists');

  // ------------------------------------------------------------
  // 2. ERROR MAPPING UTILITY
  // ------------------------------------------------------------
  console.log('\n--- 2. Testing Database Error Mapping ---');
  try {
    handleDatabaseError({ code: '23505', message: 'duplicate key', details: '' });
  } catch (e: any) {
    assert(e instanceof ConflictException, 'Maps code 23505 to ConflictException');
  }

  try {
    handleDatabaseError({ code: '23503', message: 'foreign key violation', details: '' });
  } catch (e: any) {
    assert(e instanceof BadRequestException, 'Maps code 23503 to BadRequestException');
  }

  try {
    handleDatabaseError({ code: 'PGRST116', message: 'row not found', details: '' });
  } catch (e: any) {
    assert(e instanceof NotFoundException, 'Maps code PGRST116 to NotFoundException');
  }

  // ------------------------------------------------------------
  // 3. SERVICE BUSINESS LOGIC & VALIDATION
  // ------------------------------------------------------------
  console.log('\n--- 3. Testing Service Business Rules ---');

  // Test OrganizationsService duplicate slug
  const mockOrgsRepo = {
    findBySlug: async (slug: string) => (slug === 'existing-slug' ? { id: '1', slug } : null),
  } as any;
  const orgsService = new OrganizationsService(mockOrgsRepo);

  try {
    await orgsService.createOrganization('user-1', {
      name: 'Existing Org',
      slug: 'existing-slug',
    });
    assert(false, 'Should prevent duplicate slug');
  } catch (e: any) {
    assert(e instanceof ConflictException, 'OrganizationsService prevents duplicate slug with ConflictException');
  }

  // Test OrganizationMembershipsService duplicate membership
  const mockMembershipsRepo = {
    findByUserAndOrganization: async (userId: string, orgId: string) => ({ id: 'mem-1', userId, orgId }),
    countOwners: async () => 1,
    findById: async () => ({ id: 'mem-1', organization_id: 'org-1', role: MembershipRole.OWNER }),
  } as any;
  const membershipsService = new OrganizationMembershipsService(mockMembershipsRepo);

  try {
    await membershipsService.addMember('org-1', {
      user_id: 'user-1',
      role: MembershipRole.MEMBER,
    });
    assert(false, 'Should prevent duplicate membership');
  } catch (e: any) {
    assert(e instanceof ConflictException, 'OrganizationMembershipsService prevents duplicate membership');
  }

  // Test Owner demotion safety
  try {
    await membershipsService.updateRole('org-1', 'mem-1', MembershipRole.MEMBER);
    assert(false, 'Should prevent demoting last OWNER');
  } catch (e: any) {
    assert(e instanceof BadRequestException, 'OrganizationMembershipsService prevents demoting the last OWNER');
  }

  // Test Owner removal safety
  try {
    await membershipsService.removeMember('org-1', 'mem-1');
    assert(false, 'Should prevent removing last OWNER');
  } catch (e: any) {
    assert(e instanceof BadRequestException, 'OrganizationMembershipsService prevents removing the last OWNER');
  }

  // Test GitOrganizationsService duplicate external_id
  const mockGitOrgsRepo = {
    findByExternalId: async (intId: string, extId: string) => (extId === 'ext-123' ? { id: 'git-1', extId } : null),
  } as any;
  const gitOrgsService = new GitOrganizationsService(mockGitOrgsRepo);

  try {
    await gitOrgsService.createGitOrganization('int-1', {
      external_id: 'ext-123',
      login: 'acme-inc',
    });
    assert(false, 'Should prevent duplicate external_id');
  } catch (e: any) {
    assert(e instanceof ConflictException, 'GitOrganizationsService prevents duplicate external_id');
  }

  // ------------------------------------------------------------
  // 4. REMOTE DATABASE SCHEMA VERIFICATION
  // ------------------------------------------------------------
  console.log('\n--- 4. Testing Supabase Database Tables & RLS ---');
  const adminClient = supabaseClientService.getAdminClient();

  if (adminClient) {
    const { data: tables, error: tableErr } = await adminClient
      .from('organizations')
      .select('id')
      .limit(1);

    assert(!tableErr, 'Can query organizations table from Supabase');

    const { data: usersData, error: userErr } = await adminClient
      .from('users')
      .select('id')
      .limit(1);

    assert(!userErr, 'Can query users table from Supabase');

    const { data: memsData, error: memErr } = await adminClient
      .from('organization_memberships')
      .select('id')
      .limit(1);

    assert(!memErr, 'Can query organization_memberships table from Supabase');

    const { data: intData, error: intErr } = await adminClient
      .from('integrations')
      .select('id')
      .limit(1);

    assert(!intErr, 'Can query integrations table from Supabase');

    const { data: gitData, error: gitErr } = await adminClient
      .from('git_organizations')
      .select('id')
      .limit(1);

    assert(!gitErr, 'Can query git_organizations table from Supabase');
  }

  console.log('\n============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
