import { Router } from 'express';
import { ActivityControllers } from './activity.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.get('/recent', authGuard('Admin', 'Project Manager', 'Team Member'), ActivityControllers.getRecent);

export const ActivityRoutes = router;
