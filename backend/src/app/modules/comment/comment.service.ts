import { IComment } from './comment.interface.js';
import { Comment } from './comment.model.js';
import { Task } from '../task/task.model.js';
import { ActivityServices } from '../activity/activity.service.js';
import { NotificationServices } from '../notification/notification.service.js';
import AppError from '../../errors/AppError.js';
import { Types } from 'mongoose';
import { socketHelper } from '../../helpers/socketHelper.js';

const addComment = async (payload: IComment, userId: string, userName: string) => {
  const task = await Task.findById(payload.task).populate('project');
  if (!task) throw new AppError(404, 'Task not found!');

  const result = await Comment.create(payload);

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Added a comment on task "${task.title}": "${payload.text.substring(0, 30)}${payload.text.length > 30 ? '...' : ''}"`,
    project: task.project._id as any,
    projectName: (task.project as any).name,
    task: task._id as any,
    taskTitle: task.title,
  });

  // Trigger notification for task assignee if they are not the comment author
  if (task.assignedTo && task.assignedTo.toString() !== userId) {
    await NotificationServices.createNotification({
      recipient: task.assignedTo,
      sender: new Types.ObjectId(userId),
      userName,
      action: `commented on your task "${task.title}": "${payload.text.substring(0, 30)}${payload.text.length > 30 ? '...' : ''}"`,
      project: task.project._id as any,
      task: task._id as any,
    });
  }

  // Socket emit
  socketHelper.emitToRoom(task.project._id.toString(), 'new-comment', { taskId: task._id, comment: result });

  return result;
};

const getCommentsByTaskId = async (taskId: string) => {
  return await Comment.find({ task: taskId })
    .populate('user', 'name email role')
    .sort({ createdAt: 1 });
};

export const CommentServices = {
  addComment,
  getCommentsByTaskId,
};
