import { Types } from 'mongoose';

export interface IActivity {
  user: Types.ObjectId;
  userName: string;
  action: string;
  project?: Types.ObjectId;
  projectName?: string;
  task?: Types.ObjectId;
  taskTitle?: string;
  createdAt?: Date;
}
