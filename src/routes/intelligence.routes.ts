import { Router } from 'express';
import { intelligenceController } from '../controllers/intelligence.controller';

const router = Router();

router.get('/dashboard/kpis', intelligenceController.getDashboardKPIs);
router.get('/projects', intelligenceController.getProjects);
router.get('/projects/:id', intelligenceController.getProjectById);
router.get('/developers/workloads', intelligenceController.getDeveloperWorkloads);

export default router;
