import { Router } from 'express';
import { UserRoutes } from '../modules/user/user.routes.js';
import { ProjectRoutes } from '../modules/project/project.routes.js';
import { TaskRoutes } from '../modules/task/task.routes.js';
import { CommentRoutes } from '../modules/comment/comment.routes.js';
import { ActivityRoutes } from '../modules/activity/activity.routes.js';

const router = Router();

const moduleRoutes = [
  { path: '/users', route: UserRoutes },
  { path: '/projects', route: ProjectRoutes },
  { path: '/tasks', route: TaskRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/activities', route: ActivityRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
