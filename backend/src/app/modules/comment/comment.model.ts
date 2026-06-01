import { Schema, model } from 'mongoose';
import { IComment } from './comment.interface.js';

const commentSchema = new Schema<IComment>(
  {
    task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

export const Comment = model<IComment>('Comment', commentSchema);
