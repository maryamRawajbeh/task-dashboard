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
Create .env.local in the root:
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
Run the development server:
npm run dev
Open http://localhost:3000
Demo Credentials
Email	Password	Role
admin@example.com
	admin123	Admin
ahmed@example.com
	ahmed123	User
sara@example.com
	sara123	Manager
Features
JWT authentication with protected routes
Dashboard with task statistics
Charts: Pie chart and bar chart for task distribution
Task management: Add, edit, delete tasks via modal
Notifications system:
Triggered when a task is assigned or updated
Visible in a panel or dropdown
Each notification includes: message, related user, timestamp
Optional toast messages for immediate feedback
Caching & Performance Optimization:
Efficient data fetching using React Query or SWR
Avoids unnecessary API calls
Reuses cached data when possible
Automatically refreshes data when needed
Handles loading and error states properly
Responsive design for desktop and mobile
Notes
Make sure to update .env.local with your own secret key for NextAuth.js
Notifications and caching significantly improve the user experience by providing instant feedback and reducing unnecessary server calls