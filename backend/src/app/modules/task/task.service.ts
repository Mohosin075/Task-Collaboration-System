import { ITask } from './task.interface.js';
import { Task } from './task.model.js';
import { Comment } from '../comment/comment.model.js';
import { Project } from '../project/project.model.js';
import { ActivityServices } from '../activity/activity.service.js';
import { NotificationServices } from '../notification/notification.service.js';
import AppError from '../../errors/AppError.js';
import { Types } from 'mongoose';
import { socketHelper } from '../../helpers/socketHelper.js';

const createTask = async (payload: ITask, userId: string, userName: string) => {
  // Validate project existence
  const project = await Project.findById(payload.project);
  if (!project) throw new AppError(404, 'Project not found!');

  // Rule 1: Prevent duplicate task titles in the same project
  const duplicate = await Task.findOne({ project: payload.project, title: payload.title });
  if (duplicate) {
    throw new AppError(400, 'This task already exists in the project.');
  }

  // Rule 2: Prevent setting past dates as deadlines
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(payload.dueDate) < today) {
    throw new AppError(400, 'Please select a valid deadline.');
  }

  const result = await Task.create(payload);

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Task "${result.title}" created in project "${project.name}"`,
    project: project._id as any,
    projectName: project.name,
    task: result._id as any,
    taskTitle: result.title,
  });

  // Trigger notification for task assignee if assigned to someone else
  if (result.assignedTo && result.assignedTo.toString() !== userId) {
    await NotificationServices.createNotification({
      recipient: result.assignedTo,
      sender: new Types.ObjectId(userId),
      userName,
      action: `assigned you a new task: "${result.title}" in project "${project.name}"`,
      project: project._id as any,
      task: result._id as any,
    });
  }

  // Emit real-time update to project room
  socketHelper.emitToRoom(payload.project.toString(), 'task-created', result);
  socketHelper.emitToAll('task-status-changed', { projectId: payload.project, taskId: result._id });

  return result;
};

const getTasks = async (filter: Record<string, any> = {}, options: { page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc' } = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 100; // Default large limit for simplicity, or configurable
  const skip = (page - 1) * limit;

  let sortQuery: Record<string, 1 | -1> = { createdAt: -1 }; // default sort
  if (options.sortBy) {
    const orderNum = options.order === 'asc' ? 1 : -1;
    sortQuery = { [options.sortBy]: orderNum };
  }

  const query = Task.find(filter)
    .populate('assignedTo', 'name email role')
    .populate('project', 'name')
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  const total = await Task.countDocuments(filter);
  const data = await query;

  const dataWithCommentsCount = await Promise.all(
    data.map(async (task: any) => {
      const commentCount = await Comment.countDocuments({ task: task._id });
      return {
        ...task.toObject(),
        commentCount,
      };
    })
  );

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: dataWithCommentsCount,
  };
};

const updateTask = async (
  id: string,
  payload: Partial<ITask>,
  userId: string,
  userName: string,
  userRole: string
) => {
  const task = await Task.findById(id).populate('project', 'name');
  if (!task) throw new AppError(404, 'Task not found!');

  // Role restriction: Team Members can ONLY update task status of their assigned tasks
  if (userRole === 'Team Member') {
    const assignedId = task.assignedTo?._id?.toString() || task.assignedTo?.toString();
    if (!assignedId || assignedId !== userId) {
      throw new AppError(403, 'Team members are only allowed to update the status of their assigned tasks!');
    }
    const allowedKeys = ['status'];
    const payloadKeys = Object.keys(payload);
    const isOnlyStatusUpdate = payloadKeys.every((key) => allowedKeys.includes(key));
    if (!isOnlyStatusUpdate) {
      throw new AppError(403, 'Team members are only allowed to update the status of their assigned tasks!');
    }
  }

  // Rule 3: Prevent assigning/reassigning completed tasks
  if (task.status === 'Completed' && payload.assignedTo && payload.assignedTo.toString() !== task.assignedTo.toString()) {
    throw new AppError(400, 'Completed tasks cannot be reassigned.');
  }

  // Rule 2: Prevent setting past dates as deadlines if updated
  if (payload.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(payload.dueDate) < today) {
      throw new AppError(400, 'Please select a valid deadline.');
    }
  }

  // Rule 1: Prevent duplicate task titles in the same project if updated
  if (payload.title && payload.title !== task.title) {
    const projectId = payload.project || task.project;
    const duplicate = await Task.findOne({ project: projectId, title: payload.title });
    if (duplicate) {
      throw new AppError(400, 'This task already exists in the project.');
    }
  }

  const result = await Task.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).populate('assignedTo', 'name email role');

  // Trigger notification if task is reassigned
  if (payload.assignedTo && payload.assignedTo.toString() !== task.assignedTo?.toString()) {
    await NotificationServices.createNotification({
      recipient: new Types.ObjectId(payload.assignedTo),
      sender: new Types.ObjectId(userId),
      userName,
      action: `reassigned you the task: "${task.title}" in project "${(task.project as any).name}"`,
      project: task.project._id as any,
      task: task._id as any,
    });
  }

  // Trigger notification if status is updated by someone other than the assignee
  if (payload.status && payload.status !== task.status && task.assignedTo && task.assignedTo.toString() !== userId) {
    await NotificationServices.createNotification({
      recipient: task.assignedTo as any,
      sender: new Types.ObjectId(userId),
      userName,
      action: `marked your task "${task.title}" status as "${payload.status}"`,
      project: task.project._id as any,
      task: task._id as any,
    });
  }

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: payload.status && payload.status !== task.status
      ? `Task "${task.title}" status marked as ${payload.status}`
      : `Task "${task.title}" updated`,
    project: task.project._id as any,
    projectName: (task.project as any).name,
    task: task._id as any,
    taskTitle: task.title,
  });

  // Emit Socket events
  socketHelper.emitToRoom(task.project.toString(), 'task-updated', result);
  socketHelper.emitToAll('task-status-changed', { projectId: task.project, taskId: task._id, status: payload.status });

  return result;
};

const deleteTask = async (id: string, userId: string, userName: string) => {
  const task = await Task.findById(id).populate('project', 'name');
  if (!task) throw new AppError(404, 'Task not found!');

  const result = await Task.findByIdAndDelete(id);

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Task "${task.title}" deleted from project "${(task.project as any).name}"`,
    project: task.project._id as any,
    projectName: (task.project as any).name,
    task: task._id as any,
    taskTitle: task.title,
  });

  socketHelper.emitToRoom(task.project.toString(), 'task-deleted', id);
  socketHelper.emitToAll('task-status-changed', { projectId: task.project, taskId: id });

  return result;
};

export const TaskServices = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
