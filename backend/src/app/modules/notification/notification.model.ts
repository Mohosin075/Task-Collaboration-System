import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface.js';

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    action: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>('Notification', notificationSchema);
