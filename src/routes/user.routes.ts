import { Router } from 'express';
import { usersController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateParams } from '../validators/validate.middleware';
import { updateUserSchema, userIdParamSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validateBody(updateUserSchema), usersController.updateMe);
router.get('/:id', validateParams(userIdParamSchema), usersController.getUserById);

export default router;
