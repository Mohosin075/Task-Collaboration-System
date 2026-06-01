import { Types } from 'mongoose';

export interface IComment {
  task: Types.ObjectId;
  user: Types.ObjectId;
  userName: string;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}
