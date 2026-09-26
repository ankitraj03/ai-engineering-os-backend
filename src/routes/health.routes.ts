import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router = Router();

router.get('/', healthController.getHealth);
router.get('/db', (req, res) => healthController.getDatabaseHealth(req, res));

export default router;
