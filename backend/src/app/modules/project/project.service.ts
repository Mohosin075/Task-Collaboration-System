import { IProject } from './project.interface.js';
import { Project } from './project.model.js';
import { ActivityServices } from '../activity/activity.service.js';
import AppError from '../../errors/AppError.js';
import { Types } from 'mongoose';

const createProject = async (payload: IProject, userId: string, userName: string) => {
  const result = await Project.create(payload);

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Project "${result.name}" created`,
    project: result._id as any,
    projectName: result.name,
  });

  return result;
};

const getProjects = async () => {
  return await Project.find().populate('members', 'name email role');
};

const getProjectById = async (id: string) => {
  const project = await Project.findById(id).populate('members', 'name email role');
  if (!project) throw new AppError(404, 'Project not found!');
  return project;
};

const updateProject = async (
  id: string,
  payload: Partial<IProject>,
  userId: string,
  userName: string
) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(404, 'Project not found!');

  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Project "${project.name}" updated`,
    project: project._id as any,
    projectName: project.name,
  });

  return result;
};

const deleteProject = async (id: string, userId: string, userName: string) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(404, 'Project not found!');

  const result = await Project.findByIdAndDelete(id);

  // Log activity
  await ActivityServices.logActivity({
    user: new Types.ObjectId(userId),
    userName,
    action: `Project "${project.name}" deleted`,
    project: project._id as any,
    projectName: project.name,
  });

  return result;
};

export const ProjectServices = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
