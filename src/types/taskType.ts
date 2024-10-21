
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Completed']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.date().optional(),
});

const taskPutSchema=z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.date().optional(),
})

export {taskSchema,taskPutSchema}