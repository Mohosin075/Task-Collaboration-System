import { Schema, model } from 'mongoose';
import { IActivity } from './activity.interface.js';

const activitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String },
    task: { type: Schema.Types.ObjectId, ref: 'Task' },
    taskTitle: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Activity = model<IActivity>('Activity', activitySchema);
