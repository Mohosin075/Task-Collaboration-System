import { Schema, model } from 'mongoose';
import { IProject } from './project.interface.js';

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'On Hold'],
      default: 'Active',
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

export const Project = model<IProject>('Project', projectSchema);
