# TaskFlow Dashboard

A task management dashboard built with Next.js and TypeScript.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- NextAuth.js (JWT authentication)
- Recharts (charts)

## Getting Started

1. Install dependencies:
```bash
   npm install
```

2. Create `.env.local` in the root:
```
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
```

3. Run the development server:
```bash
   npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@taskflow.com | admin123 | Admin |
| sara@taskflow.com | sara123 | Manager |

## Features

- JWT authentication with protected routes
- Dashboard with task statistics
- Pie chart and bar chart for task distribution
- Add new tasks via modal
- Responsive design