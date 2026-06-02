import { z } from 'zod';

const createTaskSchema = z.object({
  body: z.object({
    project: z.string({ required_error: 'Project ID is required' }),
    title: z.string({ required_error: 'Task Title is required' }).min(2).max(150),
    description: z.string().optional(),
    assignedTo: z.string({ required_error: 'Assigned Member ID is required' }),
    dueDate: z.string({ required_error: 'Due Date is required' }).transform((val) => new Date(val)),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    status: z.enum(['Todo', 'In Progress', 'Completed']).optional(),
    attachments: z.array(z.string()).optional(),
    subtasks: z.array(z.object({
      _id: z.string().optional(),
      title: z.string(),
      isCompleted: z.boolean().default(false),
    })).optional(),
  }),
});

const updateTaskSchema = z.object({
  body: z.object({
    project: z.string().optional(),
    title: z.string().min(2).max(150).optional(),
    description: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.string().transform((val) => new Date(val)).optional(),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    status: z.enum(['Todo', 'In Progress', 'Completed']).optional(),
    attachments: z.array(z.string()).optional(),
    subtasks: z.array(z.object({
      _id: z.string().optional(),
      title: z.string(),
      isCompleted: z.boolean(),
    })).optional(),
  }),
});

export const TaskValidations = {
  createTaskSchema,
  updateTaskSchema,
};
