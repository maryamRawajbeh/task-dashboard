import { Task } from "@/types"

// Shared in-memory store — swap with a real DB (Prisma, Supabase, etc.) in production
export let tasks: Task[] = [
  { id: 1,  title: "Design system architecture",    description: "Plan the overall system structure and component hierarchy.", status: "completed",  priority: "high",   due: "2025-03-01", assignee: "Ahmed" },
  { id: 2,  title: "Implement authentication flow", description: "Set up NextAuth with JWT and protected routes.",               status: "completed",  priority: "high",   due: "2025-03-05", assignee: "Sara"  },
  { id: 3,  title: "Build dashboard UI",            description: "Create the main dashboard with stats, charts, and task table.", status: "completed",  priority: "medium", due: "2025-03-08", assignee: "Ahmed" },
  { id: 4,  title: "API integration tests",         description: "Write integration tests for all API endpoints.",               status: "in-progress", priority: "medium", due: "2026-03-20", assignee: "Sara"  },
  { id: 5,  title: "Performance optimization",      description: "Audit and optimize slow queries and heavy components.",        status: "pending",     priority: "low",    due: "2026-03-25", assignee: "Ahmed" },
  { id: 6,  title: "Deploy to production",          description: "Set up CI/CD pipeline and deploy to Vercel.",                  status: "pending",     priority: "high",   due: "2026-04-01", assignee: "Sara"  },
  { id: 7,  title: "Write unit tests",              description: "Cover all utility functions and components with unit tests.",  status: "in-progress", priority: "medium", due: "2026-03-15", assignee: "Ahmed" },
  { id: 8,  title: "Update documentation",          description: "Update README and inline code documentation.",                 status: "pending",     priority: "low",    due: "2026-03-28", assignee: "Sara"  },
  { id: 9,  title: "Code review session",           description: "Review open PRs and provide feedback to the team.",           status: "pending",     priority: "medium", due: "2026-03-18", assignee: "Ahmed" },
  { id: 10, title: "Security audit",                description: "Audit authentication, input validation, and data exposure.",  status: "pending",     priority: "high",   due: "2026-03-30", assignee: "Sara"  },
  { id: 11, title: "Mobile responsiveness",         description: "Ensure all pages work correctly on mobile devices.",          status: "pending",     priority: "medium", due: "2026-04-05", assignee: "Ahmed" },
  { id: 12, title: "Dark mode support",             description: "Add dark/light theme toggle across the application.",         status: "pending",     priority: "low",    due: "2026-04-10", assignee: "Sara"  },
]
export let nextId = 13

export function getAllTasks()              { return tasks }
export function getTaskById(id: number)   { return tasks.find((t) => t.id === id) ?? null }
export function createTask(data: Omit<Task, "id">): Task {
  const task: Task = { id: nextId++, ...data }
  tasks = [task, ...tasks]
  return task
}
export function updateTask(id: number, data: Partial<Task>): Task | null {
  const i = tasks.findIndex((t) => t.id === id)
  if (i === -1) return null
  tasks[i] = { ...tasks[i], ...data, id }
  return tasks[i]
}
export function deleteTask(id: number): boolean {
  const exists = tasks.some((t) => t.id === id)
  tasks = tasks.filter((t) => t.id !== id)
  return exists
}