import * as dotenv from 'dotenv';
dotenv.config({ path: ['.env', '../.env'] });

import request from 'supertest';
import { app } from '../src/app';
import { usersRepository, UsersRepository } from '../src/repositories/user.repository';
import { organizationsRepository, OrganizationsRepository } from '../src/repositories/organization.repository';
import { organizationMembershipsRepository, OrganizationMembershipsRepository } from '../src/repositories/membership.repository';
import { integrationsRepository, IntegrationsRepository } from '../src/repositories/integration.repository';
import { gitOrganizationsRepository, GitOrganizationsRepository } from '../src/repositories/git-organization.repository';

import { UsersService } from '../src/services/user.service';
import { OrganizationsService } from '../src/services/organization.service';
import { OrganizationMembershipsService } from '../src/services/membership.service';
import { IntegrationsService } from '../src/services/integration.service';
import { GitOrganizationsService } from '../src/services/git-organization.service';

import { handleDatabaseError } from '../src/utils/database-error';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  InternalServerError,
} from '../src/utils/app-error';
import { MembershipRole, MembershipStatus, IntegrationProvider } from '../src/models/enums';

async function runParitySuite() {
  console.log('============================================================');
  console.log('🧪 RUNNING EXPRESS MIGRATION PARITY & VERIFICATION SUITE');
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
  // 1. REPOSITORY METHOD PARITY
  // ------------------------------------------------------------
  console.log('--- 1. Testing Repository Method Parity ---');
  assert(typeof usersRepository.create === 'function', 'UsersRepository.create exists');
  assert(typeof usersRepository.findById === 'function', 'UsersRepository.findById exists');
  assert(typeof usersRepository.findByEmail === 'function', 'UsersRepository.findByEmail exists');
  assert(typeof usersRepository.update === 'function', 'UsersRepository.update exists');
  assert(typeof usersRepository.delete === 'function', 'UsersRepository.delete exists');

  assert(typeof organizationsRepository.create === 'function', 'OrganizationsRepository.create exists');
  assert(typeof organizationsRepository.createWithOwner === 'function', 'OrganizationsRepository.createWithOwner exists');
  assert(typeof organizationsRepository.findById === 'function', 'OrganizationsRepository.findById exists');
  assert(typeof organizationsRepository.findBySlug === 'function', 'OrganizationsRepository.findBySlug exists');
  assert(typeof organizationsRepository.findByUserId === 'function', 'OrganizationsRepository.findByUserId exists');
  assert(typeof organizationsRepository.update === 'function', 'OrganizationsRepository.update exists');
  assert(typeof organizationsRepository.delete === 'function', 'OrganizationsRepository.delete exists');

  assert(typeof organizationMembershipsRepository.create === 'function', 'OrganizationMembershipsRepository.create exists');
  assert(typeof organizationMembershipsRepository.findById === 'function', 'OrganizationMembershipsRepository.findById exists');
  assert(typeof organizationMembershipsRepository.findByUserAndOrganization === 'function', 'OrganizationMembershipsRepository.findByUserAndOrganization exists');
  assert(typeof organizationMembershipsRepository.findByOrganization === 'function', 'OrganizationMembershipsRepository.findByOrganization exists');
  assert(typeof organizationMembershipsRepository.findByUser === 'function', 'OrganizationMembershipsRepository.findByUser exists');
  assert(typeof organizationMembershipsRepository.updateRole === 'function', 'OrganizationMembershipsRepository.updateRole exists');
  assert(typeof organizationMembershipsRepository.updateStatus === 'function', 'OrganizationMembershipsRepository.updateStatus exists');
  assert(typeof organizationMembershipsRepository.countOwners === 'function', 'OrganizationMembershipsRepository.countOwners exists');
  assert(typeof organizationMembershipsRepository.delete === 'function', 'OrganizationMembershipsRepository.delete exists');

  assert(typeof integrationsRepository.create === 'function', 'IntegrationsRepository.create exists');
  assert(typeof integrationsRepository.findById === 'function', 'IntegrationsRepository.findById exists');
  assert(typeof integrationsRepository.findByOrganization === 'function', 'IntegrationsRepository.findByOrganization exists');
  assert(typeof integrationsRepository.findByProvider === 'function', 'IntegrationsRepository.findByProvider exists');
  assert(typeof integrationsRepository.updateStatus === 'function', 'IntegrationsRepository.updateStatus exists');
  assert(typeof integrationsRepository.delete === 'function', 'IntegrationsRepository.delete exists');

  assert(typeof gitOrganizationsRepository.create === 'function', 'GitOrganizationsRepository.create exists');
  assert(typeof gitOrganizationsRepository.findById === 'function', 'GitOrganizationsRepository.findById exists');
  assert(typeof gitOrganizationsRepository.findByIntegration === 'function', 'GitOrganizationsRepository.findByIntegration exists');
  assert(typeof gitOrganizationsRepository.findByExternalId === 'function', 'GitOrganizationsRepository.findByExternalId exists');
  assert(typeof gitOrganizationsRepository.update === 'function', 'GitOrganizationsRepository.update exists');
  assert(typeof gitOrganizationsRepository.delete === 'function', 'GitOrganizationsRepository.delete exists');

  // ------------------------------------------------------------
  // 2. ERROR MAPPING PARITY
  // ------------------------------------------------------------
  console.log('\n--- 2. Testing Database Error Mapping ---');
  try {
    handleDatabaseError({ code: '23505', message: 'duplicate key', details: '' });
  } catch (e: any) {
    assert(e instanceof ConflictError && e.statusCode === 409, 'Maps code 23505 to ConflictError (409)');
  }

  try {
    handleDatabaseError({ code: '23503', message: 'foreign key error', details: '' });
  } catch (e: any) {
    assert(e instanceof BadRequestError && e.statusCode === 400, 'Maps code 23503 to BadRequestError (400)');
  }

  try {
    handleDatabaseError({ code: '23502', message: 'not-null violation', details: '' });
  } catch (e: any) {
    assert(e instanceof BadRequestError && e.statusCode === 400, 'Maps code 23502 to BadRequestError (400)');
  }

  try {
    handleDatabaseError({ code: '22P02', message: 'invalid uuid', details: '' });
  } catch (e: any) {
    assert(e instanceof BadRequestError && e.statusCode === 400, 'Maps code 22P02 to BadRequestError (400)');
  }

  try {
    handleDatabaseError({ code: 'PGRST116', message: 'no rows returned', details: '' });
  } catch (e: any) {
    assert(e instanceof NotFoundError && e.statusCode === 404, 'Maps code PGRST116 to NotFoundError (404)');
  }

  try {
    handleDatabaseError({ code: '99999', message: 'other unknown error', details: '' });
  } catch (e: any) {
    assert(e instanceof InternalServerError && e.statusCode === 500, 'Maps unknown code to InternalServerError (500)');
  }

  // ------------------------------------------------------------
  // 3. BUSINESS LOGIC & CONSTRAINTS PARITY
  // ------------------------------------------------------------
  console.log('\n--- 3. Testing Business Logic & Guardrails ---');

  // Slug collision in OrganizationsService
  const mockOrgRepo = {
    findBySlug: async (slug: string) => (slug === 'existing-slug' ? ({} as any) : null),
  } as any;
  const orgService = new OrganizationsService(mockOrgRepo);

  try {
    await orgService.createOrganization('user-1', {
      name: 'Existing',
      slug: 'existing-slug',
    });
    assert(false, 'OrganizationsService throws on duplicate slug');
  } catch (e: any) {
    assert(e instanceof ConflictError, 'OrganizationsService throws ConflictError on duplicate slug');
  }

  // Duplicate membership in OrganizationMembershipsService
  const mockMembershipsRepo = {
    findByUserAndOrganization: async () => ({ id: 'existing-membership' } as any),
  } as any;
  const membershipsService = new OrganizationMembershipsService(mockMembershipsRepo);

  try {
    await membershipsService.addMember('org-1', { user_id: 'user-1' });
    assert(false, 'OrganizationMembershipsService throws on duplicate membership');
  } catch (e: any) {
    assert(e instanceof ConflictError, 'OrganizationMembershipsService throws ConflictError on duplicate membership');
  }

  // Owner demotion protection rule
  const mockOwnerProtectionRepo = {
    findById: async () => ({
      id: 'mem-owner',
      organization_id: 'org-1',
      role: MembershipRole.OWNER,
      status: MembershipStatus.ACTIVE,
    }),
    countOwners: async () => 1,
  } as any;
  const protectedService = new OrganizationMembershipsService(mockOwnerProtectionRepo);

  try {
    await protectedService.updateMemberRole('org-1', 'mem-owner', MembershipRole.MEMBER);
    assert(false, 'Should prevent demoting last remaining OWNER');
  } catch (e: any) {
    assert(e instanceof BadRequestError, 'Prevents demoting last remaining OWNER (throws BadRequestError)');
  }

  // Owner removal protection rule
  try {
    await protectedService.removeMember('org-1', 'mem-owner');
    assert(false, 'Should prevent removing last remaining OWNER');
  } catch (e: any) {
    assert(e instanceof BadRequestError, 'Prevents removing last remaining OWNER (throws BadRequestError)');
  }

  // Owner suspension protection rule
  try {
    await protectedService.updateMemberStatus('org-1', 'mem-owner', MembershipStatus.SUSPENDED);
    assert(false, 'Should prevent suspending last remaining OWNER');
  } catch (e: any) {
    assert(e instanceof BadRequestError, 'Prevents suspending last remaining OWNER (throws BadRequestError)');
  }

  // Integration duplicate provider
  const mockIntegrationRepo = {
    findByProvider: async () => ({ id: 'int-1' } as any),
  } as any;
  const integrationService = new IntegrationsService(mockIntegrationRepo);

  try {
    await integrationService.createIntegration('org-1', {
      provider: IntegrationProvider.GITHUB,
    });
    assert(false, 'IntegrationsService throws on duplicate provider');
  } catch (e: any) {
    assert(e instanceof ConflictError, 'IntegrationsService throws ConflictError on duplicate provider');
  }

  // Git Organization duplicate external ID
  const mockGitOrgRepo = {
    findByExternalId: async () => ({ id: 'git-1' } as any),
  } as any;
  const gitOrgService = new GitOrganizationsService(mockGitOrgRepo);

  try {
    await gitOrgService.createGitOrganization('int-1', {
      external_id: 'ext-123',
      login: 'acme-corp',
    });
    assert(false, 'GitOrganizationsService throws on duplicate external ID');
  } catch (e: any) {
    assert(e instanceof ConflictError, 'GitOrganizationsService throws ConflictError on duplicate external ID');
  }

  // ------------------------------------------------------------
  // 4. HTTP ENDPOINT PARITY (SUPERTEST)
  // ------------------------------------------------------------
  console.log('\n--- 4. Testing HTTP Endpoint Parity via Supertest ---');

  // Health endpoint
  const healthRes = await request(app).get('/health');
  assert(healthRes.status === 200, 'GET /health returns 200 OK');
  assert(healthRes.body.status === 'ok', 'GET /health body has status: ok');

  // Health endpoint via /api prefix
  const apiHealthRes = await request(app).get('/api/health');
  assert(apiHealthRes.status === 200, 'GET /api/health returns 200 OK');

  // Dashboard KPIs endpoint
  const kpiRes = await request(app).get('/dashboard/kpis');
  assert(kpiRes.status === 200, 'GET /dashboard/kpis returns 200 OK');
  assert(typeof kpiRes.body.velocity === 'number', 'GET /dashboard/kpis includes velocity metric');
  assert(typeof kpiRes.body.riskIndex === 'number', 'GET /dashboard/kpis includes riskIndex metric');

  // Projects endpoint
  const projRes = await request(app).get('/projects');
  assert(projRes.status === 200, 'GET /projects returns 200 OK');
  assert(Array.isArray(projRes.body) && projRes.body.length > 0, 'GET /projects returns array of projects');

  // Single project endpoint
  const singleProjRes = await request(app).get('/projects/agentic-workflow-engine');
  assert(singleProjRes.status === 200, 'GET /projects/:id returns 200 OK');
  assert(singleProjRes.body.id === 'agentic-workflow-engine', 'GET /projects/:id returns requested project');

  // Developer workloads endpoint
  const devRes = await request(app).get('/developers/workloads');
  assert(devRes.status === 200, 'GET /developers/workloads returns 200 OK');
  assert(Array.isArray(devRes.body) && devRes.body.length > 0, 'GET /developers/workloads returns workload items');

  // Authentication enforcement on protected routes
  const unauthMe = await request(app).get('/users/me');
  assert(unauthMe.status === 401, 'GET /users/me without Bearer token returns 401 Unauthorized');
  assert(unauthMe.body.error === 'UnauthorizedError', 'GET /users/me returns structured UnauthorizedError JSON');

  const unauthOrgs = await request(app).get('/organizations');
  assert(unauthOrgs.status === 401, 'GET /organizations without Bearer token returns 401 Unauthorized');

  const unauthCreateOrg = await request(app).post('/organizations').send({ name: 'Test' });
  assert(unauthCreateOrg.status === 401, 'POST /organizations without Bearer token returns 401 Unauthorized');

  // 404 for unknown route
  const notFoundRes = await request(app).get('/random-unknown-endpoint');
  assert(notFoundRes.status === 404, 'GET /random-unknown-endpoint returns 404 NotFoundError');

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log('\n============================================================');
  console.log(`PARITY TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runParitySuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
