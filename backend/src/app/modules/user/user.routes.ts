import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { UserValidations } from './user.validation.js';
import { UserControllers } from './user.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.post('/signup', validateRequest(UserValidations.signupSchema), UserControllers.signup);
router.post('/login', validateRequest(UserValidations.loginSchema), UserControllers.login);
router.post('/seed-demo', UserControllers.seedDemo);
router.get('/team', authGuard('Admin', 'Project Manager', 'Team Member'), UserControllers.getTeam);
router.get('/workload', authGuard('Admin', 'Project Manager'), UserControllers.getWorkload);

export const UserRoutes = router;
