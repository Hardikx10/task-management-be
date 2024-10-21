import { Router, Request, Response } from 'express';
import Task from '../models/Task';
import authMiddleware from '../middlewares/authMiddleware';
import { taskSchema,taskPutSchema } from '../types/taskType';

const router = Router();

interface TaskRequest extends Request {
    body: {
        title: string;
        description?: string;
        status: 'To Do' | 'In Progress' | 'Completed';
        priority: 'Low' | 'Medium' | 'High';
        dueDate?: Date;
      };
      user?: {
        id: string;
      };
}

router.get('/', authMiddleware, async (req: TaskRequest, res: Response) => {
  try {
    const tasks = await Task.find({ userId: req.user!.id });
    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }
    res.status(200).json(tasks);
  } catch (error:any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal server error while fetching tasks', error: error.message });
  }
});

router.post('/', authMiddleware, async (req: TaskRequest, res: Response) => {
  const { title, status, priority } = req.body;
  
  // Validate required fields
  if (!title || !status || !priority) {
    return res.status(400).json({ message: 'Title, status, and priority are required' });
  }

  const requestData = {
    ...req.body,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined, // Convert string to Date object if dueDate is provided
  };

  const valid = taskSchema.safeParse(requestData);
  if (!valid.success) {
      return res.status(411).json({
          msg: "invalid inputs",
          errors: valid.error.issues
      });
  }


  try { 
  
    const task = new Task({ ...req.body, userId: req.user!.id });
    await task.save();
    res.status(201).json(task);
  
  } catch (error:any) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Internal server error while creating task', error: error.message });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const requestData = {
    ...req.body,
    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined, // Convert string to Date object if dueDate is provided
  };

  const valid = taskPutSchema.safeParse(requestData);
  
  if (!valid.success) {
        return res.status(411).json({
            msg: "invalid inputs",
            errors: valid.error.issues
        });
  }

  // Find the task by ID
  const task = await Task.findById(req.params.id);

  // Check if the task exists and belongs to the authenticated user
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // @ts-ignore
  if (task.userId.toString() !== req.user!.id) {
    return res.status(403).json({ message: 'You are not authorized to modify this task' });
  }

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedTask);
  } catch (error:any) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Internal server error while updating task', error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

   // Find the task by ID
  const task = await Task.findById(req.params.id);

  // Check if the task exists and belongs to the authenticated user
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // @ts-ignore
  if (task.userId.toString() !== req.user!.id) {
    return res.status(403).json({ message: 'You are not authorized to delete this task' });
  }

  try {
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task successfully deleted' });
  } catch (error:any) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Internal server error while deleting task', error: error.message });
  }
});

export default router;