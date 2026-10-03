import { Router } from 'express';
import { integrationsController } from '../controllers/integration.controller';
import { gitOrganizationsController } from '../controllers/git-organization.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateParams } from '../validators/validate.middleware';
import {
  integrationIdParamSchema,
  updateIntegrationSchema,
} from '../validators/integration.validator';
import { createGitOrganizationSchema } from '../validators/git-organization.validator';

const router = Router();

router.use(authenticate);

// Direct Integration operations
router.get(
  '/:id',
  validateParams(integrationIdParamSchema),
  integrationsController.getIntegration
);

router.patch(
  '/:id',
  validateParams(integrationIdParamSchema),
  validateBody(updateIntegrationSchema),
  integrationsController.updateIntegrationStatus
);

router.delete(
  '/:id',
  validateParams(integrationIdParamSchema),
  integrationsController.deleteIntegration
);

// Nested Git Organizations
router.post(
  '/:id/git-organizations',
  validateParams(integrationIdParamSchema),
  validateBody(createGitOrganizationSchema),
  gitOrganizationsController.createGitOrganization
);

router.get(
  '/:id/git-organizations',
  validateParams(integrationIdParamSchema),
  gitOrganizationsController.getIntegrationGitOrganizations
);

export default router;
