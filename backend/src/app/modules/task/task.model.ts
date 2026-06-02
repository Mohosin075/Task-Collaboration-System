import { Schema, model } from 'mongoose';
import { ITask } from './task.interface.js';

const taskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
    },
    attachments: [{ type: String }],
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', taskSchema);
