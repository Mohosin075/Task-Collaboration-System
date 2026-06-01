import { z } from 'zod';

const createProjectSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Project Name is required' }).min(2).max(100),
    description: z.string().optional(),
    deadline: z.string({ required_error: 'Deadline is required' }).transform((val) => new Date(val)),
    status: z.enum(['Active', 'Completed', 'On Hold']).optional(),
    members: z.array(z.string()).optional(),
  }),
});

const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    deadline: z.string().transform((val) => new Date(val)).optional(),
    status: z.enum(['Active', 'Completed', 'On Hold']).optional(),
    members: z.array(z.string()).optional(),
  }),
});

export const ProjectValidations = {
  createProjectSchema,
  updateProjectSchema,
};
