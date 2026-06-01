import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface.js';
import bcrypt from 'bcrypt';
import config from '../../config/index.js';

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['Admin', 'Project Manager', 'Team Member'],
      default: 'Team Member',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password!, config.bcrypt_salt_rounds);
  next();
});

// Custom static method to find user by email
userSchema.statics.isUserExists = async function (email: string) {
  return await this.findOne({ email }).select('+password');
};

export const User = model<IUser, UserModel>('User', userSchema);
