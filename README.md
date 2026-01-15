# Captain's Log 🏴‍☠️

A pirate-themed task management platform built with Next.js, Prisma, and NextAuth.

## Features

- **Task Management**: Create, assign, edit, and complete tasks (missions)
- **Project Management**: Organize tasks into projects (ships)
- **User Roles**: Captain (Admin) and Crew (User) roles
- **AI Priority Detection**: Automatic task priority detection from descriptions
- **Pirate Theme**: Fully themed interface with pirate terminology and styling

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** (PostgreSQL)
- **NextAuth** (Authentication)
- **Tailwind CSS** (Styling)
- **Pirata One Font** (Google Fonts)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your database and configure Prisma:
```bash
npx prisma generate
npx prisma migrate dev
```

3. Set up environment variables in `.env`:
```
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_secret_key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions and facades
- `/prisma` - Database schema and migrations
- `/public` - Static assets (images, logos)

## Design Patterns

- **Facade Pattern**: `TaskCompletionFacade` for task completion logic
- **Adapter Pattern**: NextAuth PrismaAdapter for authentication


