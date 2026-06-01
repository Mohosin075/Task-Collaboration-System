import { Model } from 'mongoose';

export type IUserRole = 'Admin' | 'Project Manager' | 'Team Member';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: IUserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends Model<IUser> {
  isUserExists(email: string): Promise<IUser | null>;
}
