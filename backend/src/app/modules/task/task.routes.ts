import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { TaskValidations } from './task.validation.js';
import { TaskControllers } from './task.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.post(
  '/',
  authGuard('Admin', 'Project Manager'),
  validateRequest(TaskValidations.createTaskSchema),
  TaskControllers.create
);

router.get(
  '/',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  TaskControllers.getAll
);

router.patch(
  '/:id',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  validateRequest(TaskValidations.updateTaskSchema),
  TaskControllers.update
);

router.delete(
  '/:id',
  authGuard('Admin', 'Project Manager'),
  TaskControllers.deleteById
);

export const TaskRoutes = router;
