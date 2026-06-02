import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { NotificationServices } from './notification.service.js';

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const result = await NotificationServices.getNotifications(userId);
  res.status(200).json({
    success: true,
    message: 'Notifications fetched successfully!',
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const id = req.params.id as string;
  const result = await NotificationServices.markAsRead(id, userId);
  res.status(200).json({
    success: true,
    message: 'Notification marked as read successfully!',
    data: result,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const result = await NotificationServices.markAllAsRead(userId);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read successfully!',
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId as string;
  const id = req.params.id as string;
  const result = await NotificationServices.deleteNotification(id, userId);
  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully!',
    data: result,
  });
});

export const NotificationControllers = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
