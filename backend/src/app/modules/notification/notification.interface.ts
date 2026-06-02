import { Types } from 'mongoose';

export interface INotification {
  recipient: Types.ObjectId; // User receiving the notification
  sender?: Types.ObjectId;    // User who triggered the action
  userName?: string;          // Name of the sender (e.g. for display)
  action: string;             // Action description
  project?: Types.ObjectId;   // Linked project (optional)
  task?: Types.ObjectId;      // Linked task (optional)
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
