import { z } from 'zod';

const signupSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2).max(50),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    role: z.enum(['Admin', 'Project Manager', 'Team Member']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

export const UserValidations = {
  signupSchema,
  loginSchema,
};
