import { Types } from 'mongoose';

export type ITaskPriority = 'High' | 'Medium' | 'Low';
export type ITaskStatus = 'Todo' | 'In Progress' | 'Completed';

export interface ISubTask {
  _id?: string;
  title: string;
  isCompleted: boolean;
}

export interface ITask {
  project: Types.ObjectId;
  title: string;
  description?: string;
  assignedTo: Types.ObjectId;
  dueDate: Date;
  priority: ITaskPriority;
  status: ITaskStatus;
  attachments?: string[];
  subtasks?: ISubTask[];
  createdAt?: Date;
  updatedAt?: Date;
}

