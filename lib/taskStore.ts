import { Task } from "@/types"

// نحط البيانات على global عشان تبقى محفوظة بين الـ requests في Next.js
declare global {
  // eslint-disable-next-line no-var
  var __tasks: Task[] | undefined
  // eslint-disable-next-line no-var
  var __nextId: number | undefined
}

const initialTasks: Task[] = [
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

// استخدم global عشان يبقى نفس الـ instance بين كل الـ requests
if (!global.__tasks)  global.__tasks  = initialTasks
if (!global.__nextId) global.__nextId = 13

export function getAllTasks(): Task[] {
  return global.__tasks!
}

export function getTaskById(id: number): Task | null {
  return global.__tasks!.find((t) => t.id === id) ?? null
}

export function createTask(data: Omit<Task, "id">): Task {
  const task: Task = { id: global.__nextId!++, ...data }
  global.__tasks = [task, ...global.__tasks!]
  return task
}

export function updateTask(id: number, data: Partial<Task>): Task | null {
  const i = global.__tasks!.findIndex((t) => t.id === id)
  if (i === -1) return null
  global.__tasks![i] = { ...global.__tasks![i], ...data, id }
  return global.__tasks![i]
}

export function deleteTask(id: number): boolean {
  const exists = global.__tasks!.some((t) => t.id === id)
  global.__tasks = global.__tasks!.filter((t) => t.id !== id)
  return exists
}