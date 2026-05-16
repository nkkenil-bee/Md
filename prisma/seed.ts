import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const memberPassword = await bcrypt.hash("member123", 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: "member1@example.com" },
    update: {},
    create: {
      email: "member1@example.com",
      name: "John Member",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: "member2@example.com" },
    update: {},
    create: {
      email: "member2@example.com",
      name: "Jane Member",
      password: memberPassword,
      role: "MEMBER",
    },
  });

  // Projects
  const project1 = await prisma.project.create({
    data: {
      title: "Website Redesign",
      description: "Overhaul the company website with a modern aesthetic.",
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Mobile App Development",
      description: "Build a cross-platform mobile app for customers.",
      creatorId: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member2.id },
        ],
      },
    },
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Design Mockups",
        description: "Create initial UI/UX designs for the new website.",
        status: "COMPLETED",
        priority: "HIGH",
        dueDate: new Date(),
        projectId: project1.id,
        assignedToId: member1.id,
        creatorId: admin.id,
      },
      {
        title: "Develop Frontend",
        description: "Implement the React components as per designs.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 86400000 * 7),
        projectId: project1.id,
        assignedToId: member1.id,
        creatorId: admin.id,
      },
      {
        title: "API Design",
        description: "Define the REST endpoints for the mobile app.",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 86400000 * 3),
        projectId: project2.id,
        assignedToId: member2.id,
        creatorId: admin.id,
      },
      {
        title: "Database Schema",
        description: "Design the database schema for the mobile app.",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() - 86400000), // Overdue
        projectId: project2.id,
        assignedToId: member2.id,
        creatorId: admin.id,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
