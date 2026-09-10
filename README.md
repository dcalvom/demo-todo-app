# Demo Todo App

A multi-user organizational todo management app built with Next.js 16, Convex, and custom JWT authentication.

## Features

- **Custom JWT Authentication** with bcrypt password hashing
- **Role-based Access Control**: CEO, Boss, Employee
- **Departments** with boss assignment
- **Todo Management** with expiration dates, priority levels, and status tracking
- **File Attachments** via Vercel Blob storage
- **Real-time updates** powered by Convex

## Roles

- **CEO**: Full organization overview, all departments, all todos, user management
- **Boss**: Department-scoped view, team management, assign todos to employees
- **Employee**: Personal todo view only (own assigned tasks)

## Tech Stack

- **Frontend**: Next.js 16, Tailwind CSS
- **Backend**: Convex (database + server functions)
- **Auth**: Custom JWT with bcrypt (jose + bcryptjs)
- **Storage**: Vercel Blob
- **Deployment**: Vercel

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env.local`):
   ```
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   JWT_SECRET=your-jwt-secret-at-least-32-chars
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
   ```
4. Start the Convex dev server:
   ```bash
   npx convex dev
   ```
5. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push to GitHub
2. Connect repository in Vercel
3. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `JWT_SECRET`
   - `BLOB_READ_WRITE_TOKEN`
   - `CONVEX_DEPLOY_KEY` (from Convex dashboard)
4. Deploy

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |
| `CONVEX_DEPLOY_KEY` | Convex production deploy key (CI/CD) |
