import { Router } from 'express';
import { NotificationControllers } from './notification.controller.js';
import authGuard from '../../middlewares/authGuard.js';

const router = Router();

router.get(
  '/',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  NotificationControllers.getNotifications
);

router.patch(
  '/mark-all-read',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  NotificationControllers.markAllAsRead
);

router.patch(
  '/:id/read',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  NotificationControllers.markAsRead
);

router.delete(
  '/:id',
  authGuard('Admin', 'Project Manager', 'Team Member'),
  NotificationControllers.deleteNotification
);

export const NotificationRoutes = router;
