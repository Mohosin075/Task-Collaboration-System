import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { ProjectServices } from './project.service.js';

const create = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.body.userName || 'Anonymous'; // Pass user name from client or query
  const result = await ProjectServices.createProject(req.body, userId, userName);
  
  res.status(201).json({
    success: true,
    message: 'Project created successfully!',
    data: result,
  });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getProjects();
  
  res.status(200).json({
    success: true,
    message: 'Projects fetched successfully!',
    data: result,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getProjectById(req.params.id as string);
  
  res.status(200).json({
    success: true,
    message: 'Project fetched successfully!',
    data: result,
  });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.body.userName || 'Anonymous';
  const result = await ProjectServices.updateProject(req.params.id as string, req.body, userId, userName);
  
  res.status(200).json({
    success: true,
    message: 'Project updated successfully!',
    data: result,
  });
});

const deleteById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.query.userName as string || 'Anonymous';
  const result = await ProjectServices.deleteProject(req.params.id as string, userId, userName);
  
  res.status(200).json({
    success: true,
    message: 'Project deleted successfully!',
    data: result,
  });
});

export const ProjectControllers = {
  create,
  getAll,
  getById,
  update,
  deleteById,
};
