import { Router } from 'express';
import { CommentControllers } from './comment.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.post(
  '/',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  CommentControllers.add
);

router.get(
  '/:taskId',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  CommentControllers.getByTaskId
);

export const CommentRoutes = router;
