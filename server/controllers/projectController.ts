import { Response } from "express";
import prisma from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.ts";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
});

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let projects;
    if (role === "ADMIN") {
      projects = await prisma.project.findMany({
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId } },
        },
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      });
    }

    // Calculate progress
    const response = projects.map((p) => {
      const completed = p.tasks.filter((t) => t.status === "COMPLETED").length;
      const total = p.tasks.length;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...p, progress };
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = projectSchema.parse(req.body);
    const userId = req.user!.id;

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        creatorId: userId,
        members: {
          create: { userId }, // Creator is always a member
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { 
          include: { 
            assignedTo: { select: { id: true, name: true } },
            creator: { select: { id: true, name: true } }
          } 
        },
      },
    });

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check access
    const isMember = project.members.some(m => m.userId === userId);
    if (role !== "ADMIN" && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const completed = project.tasks.filter((t) => t.status === "COMPLETED").length;
    const total = project.tasks.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ ...project, progress });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = projectSchema.parse(req.body);

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const removeProjectMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;
    await prisma.projectMember.deleteMany({
      where: {
        projectId: id,
        userId: userId,
      },
    });
    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
