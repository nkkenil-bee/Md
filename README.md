# TeamTask Pro

A comprehensive full-stack team task management platform built with React, Express, Prisma, and SQLite.

## Features

- **Authentication & RBAC**: Secure login/signup with JWT and role-based access (Admin & Member).
- **Project Management**: Create, update, and delete projects (Admin). View assigned projects (Member).
- **Task Management**: Create and assign tasks. Track status (TODO, IN PROGRESS, COMPLETED) and priority.
- **Real-time Progress**: Visual progress bars and completion percentages for projects.
- **Responsive Dashboard**: Stats overview and recent activity tracking.
- **Clean UI**: Modern, professional interface using Tailwind CSS and Lucide icons.

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios, Tailwind CSS, Motion.
- **Backend**: Node.js, Express, JWT, bcryptjs, Zod.
- **Database**: Prisma ORM with SQLite (Development) / PostgreSQL (Production ready).

## Setup Instructions

### Prerequisites
- Node.js (v18+)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Database:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

3. Start the application:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

## Demo Credentials

- **Admin User**:
  - Email: `admin@example.com`
  - Password: `admin123`
- **Member User**:
  - Email: `member1@example.com`
  - Password: `member123`

## Folder Structure

- `server.ts`: Entry point for the full-stack server.
- `server/`: Backend logic (controllers, routes, middleware, prisma).
- `src/`: Frontend React application.
- `prisma/`: Database schema and seed scripts.

## Deployment on Railway

1. Create a new Project on Railway.
2. Link your GitHub repository.
3. Add a PostgreSQL database to your Railway project.
4. Set Environment Variables:
   - `DATABASE_URL`: Your Railway Postgres connection string.
   - `JWT_SECRET`: A long random string.
   - `NODE_ENV`: `production`
5. Railway will automatically detect the `build` and `start` scripts in `package.json`.
