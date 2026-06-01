import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { UserServices } from './user.service.js';

const signup = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.signupUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User registered successfully!',
    data: result,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.loginUser(req.body);
  res.status(200).json({
    success: true,
    message: 'User logged in successfully!',
    data: result,
  });
});

const seedDemo = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createDemoUsers();
  res.status(200).json({
    success: true,
    message: 'Demo users seeded successfully!',
    data: result,
  });
});

const getTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getTeamMembers();
  res.status(200).json({
    success: true,
    message: 'Team members fetched successfully!',
    data: result,
  });
});

const getWorkload = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getWorkloadSummary();
  res.status(200).json({
    success: true,
    message: 'Workload summary fetched successfully!',
    data: result,
  });
});

export const UserControllers = {
  signup,
  login,
  seedDemo,
  getTeam,
  getWorkload,
};
