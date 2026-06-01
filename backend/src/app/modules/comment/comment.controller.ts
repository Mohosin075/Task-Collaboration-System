import { Request, Response } from 'express';
import catchAsync from '../../middlewares/catchAsync.js';
import { CommentServices } from './comment.service.js';

const add = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const userName = req.body.userName || 'Anonymous';
  const result = await CommentServices.addComment({
    ...req.body,
    user: userId,
    userName,
  }, userId, userName);
  
  res.status(201).json({
    success: true,
    message: 'Comment added successfully!',
    data: result,
  });
});

const getByTaskId = catchAsync(async (req: Request, res: Response) => {
  const result = await CommentServices.getCommentsByTaskId(req.params.taskId as string);
  res.status(200).json({
    success: true,
    message: 'Comments fetched successfully!',
    data: result,
  });
});

export const CommentControllers = {
  add,
  getByTaskId,
};
