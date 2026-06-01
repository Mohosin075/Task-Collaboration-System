import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest.js';
import { ProjectValidations } from './project.validation.js';
import { ProjectControllers } from './project.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.post(
  '/',
  authGuard('Admin', 'Project Manager'),
  validateRequest(ProjectValidations.createProjectSchema),
  ProjectControllers.create
);

router.get(
  '/',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  ProjectControllers.getAll
);

router.get(
  '/:id',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  ProjectControllers.getById
);

router.patch(
  '/:id',
  authGuard('Admin', 'Project Manager'),
  validateRequest(ProjectValidations.updateProjectSchema),
  ProjectControllers.update
);

router.delete(
  '/:id',
  authGuard('Admin', 'Project Manager'),
  ProjectControllers.deleteById
);

export const ProjectRoutes = router;
