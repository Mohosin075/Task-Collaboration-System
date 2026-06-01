import bcrypt from 'bcrypt';
import AppError from '../../errors/AppError.js';
import { jwtHelpers } from '../../helpers/jwtHelper.js';
import config from '../../config/index.js';
import { IUser } from './user.interface.js';
import { User } from './user.model.js';
import { Task } from '../task/task.model.js';

const signupUser = async (payload: IUser) => {
  const isUserExists = await User.findOne({ email: payload.email });
  if (isUserExists) {
    throw new AppError(400, 'User already exists with this email!');
  }

  const result = await User.create(payload);
  return result;
};

const loginUser = async (payload: Record<string, string>) => {
  const user = await User.isUserExists(payload.email) as any;
  if (!user) {
    throw new AppError(404, 'User not found!');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password!);
  if (!isPasswordMatched) {
    throw new AppError(401, 'Password incorrect!');
  }

  const accessToken = jwtHelpers.generateToken(
    { userId: user._id, email: user.email, role: user.role },
    config.jwt_secret,
    config.jwt_expires_in
  );

  return {
    accessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const createDemoUsers = async () => {
  const roles: Array<{ name: string; email: string; role: 'Admin' | 'Project Manager' | 'Team Member' }> = [
    { name: 'Admin Demo', email: 'admin@demo.com', role: 'Admin' },
    { name: 'PM Demo', email: 'pm@demo.com', role: 'Project Manager' },
    { name: 'Member Demo 1', email: 'member1@demo.com', role: 'Team Member' },
    { name: 'Member Demo 2', email: 'member2@demo.com', role: 'Team Member' },
  ];

  const created = [];
  for (const entry of roles) {
    let user = await User.findOne({ email: entry.email });
    if (!user) {
      user = await User.create({
        name: entry.name,
        email: entry.email,
        password: 'demo123456@Password',
        role: entry.role,
      });
    }
    created.push(user);
  }
  return created;
};

const getTeamMembers = async () => {
  // Return all users who can be assigned to tasks
  return await User.find({ role: { $in: ['Project Manager', 'Team Member'] } });
};

const getWorkloadSummary = async () => {
  // Aggregate tasks per member
  const members = await User.find({ role: { $in: ['Project Manager', 'Team Member'] } });
  const result = [];

  for (const member of members) {
    const totalTasks = await Task.countDocuments({ assignedTo: member._id });
    const completedTasks = await Task.countDocuments({ assignedTo: member._id, status: 'Completed' });
    const pendingTasks = totalTasks - completedTasks;

    result.push({
      _id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  }

  return result;
};

export const UserServices = {
  signupUser,
  loginUser,
  createDemoUsers,
  getTeamMembers,
  getWorkloadSummary,
};
