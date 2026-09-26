import { Router } from 'express';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';
import organizationRoutes from './organization.routes';
import integrationRoutes from './integration.routes';
import gitOrganizationRoutes from './git-organization.routes';
import intelligenceRoutes from './intelligence.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/integrations', integrationRoutes);
router.use('/git-organizations', gitOrganizationRoutes);
router.use('/', intelligenceRoutes);

export default router;
