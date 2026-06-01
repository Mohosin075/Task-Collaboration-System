import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { ActivityServices } from './activity.service.js';

const getRecent = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityServices.getRecentActivities();
  res.status(200).json({
    success: true,
    message: 'Recent activities fetched successfully!',
    data: result,
  });
});

export const ActivityControllers = {
  getRecent,
};
