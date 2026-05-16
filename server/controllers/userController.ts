import { Response } from "express";
import prisma from "../prisma.ts";
import { AuthRequest } from "../middleware/auth.ts";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
