import { Router } from 'express';
import { organizationsController } from '../controllers/organization.controller';
import { organizationMembershipsController } from '../controllers/membership.controller';
import { integrationsController } from '../controllers/integration.controller';
import { authenticate } from '../middleware/authenticate';
import { authorizeOrgRole } from '../middleware/authorize';
import { MembershipRole } from '../models/enums';
import { validateBody, validateParams } from '../validators/validate.middleware';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  orgIdParamSchema,
} from '../validators/organization.validator';
import {
  addMemberSchema,
  updateMemberRoleSchema,
  updateMemberStatusSchema,
  memberParamSchema,
} from '../validators/membership.validator';
import { createIntegrationSchema } from '../validators/integration.validator';

const router = Router();

router.use(authenticate);

// --- Organizations Core ---
router.post(
  '/',
  validateBody(createOrganizationSchema),
  organizationsController.createOrganization
);

router.get('/', organizationsController.getUserOrganizations);

router.get(
  '/:id',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER),
  organizationsController.getOrganization
);

router.patch(
  '/:id',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  validateBody(updateOrganizationSchema),
  organizationsController.updateOrganization
);

router.delete(
  '/:id',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER),
  organizationsController.deleteOrganization
);

// --- Nested Organization Memberships ---
router.post(
  '/:id/members',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  validateBody(addMemberSchema),
  organizationMembershipsController.addMember
);

router.get(
  '/:id/members',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER),
  organizationMembershipsController.getMembers
);

router.get(
  '/:id/members/:memberId',
  validateParams(memberParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER),
  organizationMembershipsController.getMember
);

router.patch(
  '/:id/members/:memberId/role',
  validateParams(memberParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  validateBody(updateMemberRoleSchema),
  organizationMembershipsController.updateMemberRole
);

router.patch(
  '/:id/members/:memberId/status',
  validateParams(memberParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  validateBody(updateMemberStatusSchema),
  organizationMembershipsController.updateMemberStatus
);

router.delete(
  '/:id/members/:memberId',
  validateParams(memberParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  organizationMembershipsController.removeMember
);

// --- Nested Organization Integrations ---
router.post(
  '/:id/integrations',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN),
  validateBody(createIntegrationSchema),
  integrationsController.createIntegration
);

router.get(
  '/:id/integrations',
  validateParams(orgIdParamSchema),
  authorizeOrgRole(MembershipRole.OWNER, MembershipRole.ADMIN, MembershipRole.MEMBER),
  integrationsController.getOrganizationIntegrations
);

export default router;
