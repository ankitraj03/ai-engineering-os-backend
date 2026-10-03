import { Router } from 'express';
import { gitOrganizationsController } from '../controllers/git-organization.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateParams } from '../validators/validate.middleware';
import {
  gitOrgIdParamSchema,
  updateGitOrganizationSchema,
} from '../validators/git-organization.validator';

const router = Router();

router.use(authenticate);

router.get(
  '/:id',
  validateParams(gitOrgIdParamSchema),
  gitOrganizationsController.getGitOrganization
);

router.patch(
  '/:id',
  validateParams(gitOrgIdParamSchema),
  validateBody(updateGitOrganizationSchema),
  gitOrganizationsController.updateGitOrganization
);

router.delete(
  '/:id',
  validateParams(gitOrgIdParamSchema),
  gitOrganizationsController.deleteGitOrganization
);

export default router;
