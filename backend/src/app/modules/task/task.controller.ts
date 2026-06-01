import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { TaskServices } from './task.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.body.userName || 'Anonymous';
  const result = await TaskServices.createTask(req.body, userId, userName);
  
  res.status(201).json({
    success: true,
    message: 'Task created successfully!',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm, project, status, priority, assignedTo, deadlineStatus, sortBy, order, page, limit } = req.query;

  const filter: Record<string, any> = {};

  // Search filter
  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // Dropdown filters
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  // Deadline filter status
  if (deadlineStatus) {
    const today = new Date();
    if (deadlineStatus === 'Overdue') {
      filter.dueDate = { $lt: today };
      filter.status = { $ne: 'Completed' };
    } else if (deadlineStatus === 'Upcoming') {
      filter.dueDate = { $gte: today };
    }
  }

  // Parse pagination options
  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sortBy: sortBy as string,
    order: order as 'asc' | 'desc',
  };

  const result = await TaskServices.getTasks(filter, options);
  
  res.status(200).json({
    success: true,
    message: 'Tasks fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;
  const userName = req.body.userName || 'Anonymous';
  const result = await TaskServices.updateTask(req.params.id as string, req.body, userId, userName, userRole);
  
  res.status(200).json({
    success: true,
    message: 'Task updated successfully!',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.query.userName as string || 'Anonymous';
  const result = await TaskServices.deleteTask(req.params.id as string, userId, userName);
  
  res.status(200).json({
    success: true,
    message: 'Task deleted successfully!',
    data: result,
  });
});

export const TaskControllers = {
  create,
  getAll,
  update,
  deleteById,
};
