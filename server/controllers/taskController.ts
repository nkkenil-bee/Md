import { Response } from "express";
import prisma from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.ts";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  projectId: z.string(),
  assignedToId: z.string().optional().nullable(),
});

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let tasks;
    if (role === "ADMIN") {
      tasks = await prisma.task.findMany({
        include: {
          project: { select: { title: true } },
          assignedTo: { select: { name: true, email: true } },
        },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: { assignedToId: userId },
        include: {
          project: { select: { title: true } },
          assignedTo: { select: { name: true, email: true } },
        },
      });
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = taskSchema.parse(req.body);
    const userId = req.user!.id;

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) return res.status(404).json({ message: "Task not found" });

    // Members can only update status of their assigned tasks
    if (role !== "ADMIN") {
      if (existingTask.assignedToId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Member can only update status
      const { status } = req.body;
      const updatedTask = await prisma.task.update({
        where: { id },
        data: { status },
      });
      return res.json(updatedTask);
    }

    // Admins can update everything
    const validatedData = taskSchema.partial().parse(req.body);
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : validatedData.dueDate,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;
    const role = req.user!.role;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (role !== "ADMIN" && task.assignedToId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
