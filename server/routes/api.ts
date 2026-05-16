import express from "express";
import * as authController from "../controllers/authController.ts";
import * as projectController from "../controllers/projectController.ts";
import * as taskController from "../controllers/taskController.ts";
import * as dashboardController from "../controllers/dashboardController.ts";
import * as userController from "../controllers/userController.ts";
import { authMiddleware, requireAdmin } from "../middleware/auth.ts";

const router = express.Router();

// Auth
router.post("/auth/signup", authController.signup);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.getMe);

// Users
router.get("/users", authMiddleware, requireAdmin, userController.getUsers);

// Projects
router.get("/projects", authMiddleware, projectController.getProjects);
router.post("/projects", authMiddleware, requireAdmin, projectController.createProject);
router.get("/projects/:id", authMiddleware, projectController.getProjectById);
router.put("/projects/:id", authMiddleware, requireAdmin, projectController.updateProject);
router.delete("/projects/:id", authMiddleware, requireAdmin, projectController.deleteProject);
router.post("/projects/:id/members", authMiddleware, requireAdmin, projectController.addProjectMember);
router.delete("/projects/:id/members/:userId", authMiddleware, requireAdmin, projectController.removeProjectMember);

// Tasks
router.get("/tasks", authMiddleware, taskController.getTasks);
router.post("/tasks", authMiddleware, requireAdmin, taskController.createTask);
router.get("/tasks/:id", authMiddleware, taskController.updateTask); // Reuse update for get
router.put("/tasks/:id", authMiddleware, taskController.updateTask);
router.patch("/tasks/:id/status", authMiddleware, taskController.updateTaskStatus);
router.delete("/tasks/:id", authMiddleware, requireAdmin, taskController.deleteTask);

// Dashboard
router.get("/dashboard/stats", authMiddleware, dashboardController.getDashboardStats);

export default router;
