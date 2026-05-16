import { Response } from "express";
import prisma from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.ts";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let projectCount, taskCount, completedTasks, inProgressTasks, todoTasks, overdueTasks, recentTasks;

    if (role === "ADMIN") {
      projectCount = await prisma.project.count();
      taskCount = await prisma.task.count();
      completedTasks = await prisma.task.count({ where: { status: "COMPLETED" } });
      inProgressTasks = await prisma.task.count({ where: { status: "IN_PROGRESS" } });
      todoTasks = await prisma.task.count({ where: { status: "TODO" } });
      overdueTasks = await prisma.task.count({
        where: {
          status: { not: "COMPLETED" },
          dueDate: { lt: new Date() },
        },
      });
      recentTasks = await prisma.task.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { title: true } }, assignedTo: { select: { name: true } } },
      });
    } else {
      projectCount = await prisma.project.count({
        where: { members: { some: { userId } } },
      });
      taskCount = await prisma.task.count({ where: { assignedToId: userId } });
      completedTasks = await prisma.task.count({
        where: { assignedToId: userId, status: "COMPLETED" },
      });
      inProgressTasks = await prisma.task.count({
        where: { assignedToId: userId, status: "IN_PROGRESS" },
      });
      todoTasks = await prisma.task.count({
        where: { assignedToId: userId, status: "TODO" },
      });
      overdueTasks = await prisma.task.count({
        where: {
          assignedToId: userId,
          status: { not: "COMPLETED" },
          dueDate: { lt: new Date() },
        },
      });
      recentTasks = await prisma.task.findMany({
        where: { assignedToId: userId },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { project: { select: { title: true } }, assignedTo: { select: { name: true } } },
      });
    }

    const completionPercentage = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

    res.json({
      projectCount,
      taskCount,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      completionPercentage,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
