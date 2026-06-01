import { Types } from 'mongoose';

export type IProjectStatus = 'Active' | 'Completed' | 'On Hold';

export interface IProject {
  name: string;
  description?: string;
  deadline: Date;
  status: IProjectStatus;
  members: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
