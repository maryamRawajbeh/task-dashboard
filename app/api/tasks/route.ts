import { NextRequest, NextResponse } from "next/server"
import { Task } from "@/types"

// In-memory store (resets on server restart — swap with a DB in production)
let tasks: Task[] = [
  { id: 1, title: "Design system architecture", description: "Plan the overall system structure and component hierarchy.", status: "completed", priority: "high", due: "2025-03-01", assignee: "Ahmed" },
  { id: 2, title: "Implement authentication flow", description: "Set up NextAuth with JWT and protected routes.", status: "completed", priority: "high", due: "2025-03-05", assignee: "Sara" },
  { id: 3, title: "Build dashboard UI", description: "Create the main dashboard with stats, charts, and task table.", status: "completed", priority: "medium", due: "2025-03-08", assignee: "Ahmed" },
  { id: 4, title: "API integration tests", description: "Write integration tests for all API endpoints.", status: "in-progress", priority: "medium", due: "2026-03-20", assignee: "Sara" },
  { id: 5, title: "Performance optimization", description: "Audit and optimize slow queries and heavy components.", status: "pending", priority: "low", due: "2026-03-25", assignee: "Ahmed" },
  { id: 6, title: "Deploy to production", description: "Set up CI/CD pipeline and deploy to Vercel.", status: "pending", priority: "high", due: "2026-04-01", assignee: "Sara" },
  { id: 7, title: "Write unit tests", description: "Cover all utility functions and components with unit tests.", status: "in-progress", priority: "medium", due: "2026-03-15", assignee: "Ahmed" },
  { id: 8, title: "Update documentation", description: "Update README and inline code documentation.", status: "pending", priority: "low", due: "2026-03-28", assignee: "Sara" },
  { id: 9, title: "Code review session", description: "Review open PRs and provide feedback to the team.", status: "pending", priority: "medium", due: "2026-03-18", assignee: "Ahmed" },
  { id: 10, title: "Security audit", description: "Audit authentication, input validation, and data exposure.", status: "pending", priority: "high", due: "2026-03-30", assignee: "Sara" },
]
let nextId = 11

// GET — return all tasks
export async function GET(): Promise<NextResponse<Task[]>> {
  return NextResponse.json(tasks)
}

// POST — create new task
export async function POST(req: NextRequest): Promise<NextResponse<Task>> {
  const body = await req.json()
  const newTask: Task = { id: nextId++, ...body }
  tasks = [newTask, ...tasks]
  return NextResponse.json(newTask, { status: 201 })
}

// PUT — update existing task
export async function PUT(req: NextRequest): Promise<NextResponse<Task | { error: string }>> {
  const body = await req.json()
  const index = tasks.findIndex((t) => t.id === body.id)
  if (index === -1) return NextResponse.json({ error: "Task not found" }, { status: 404 })
  tasks[index] = { ...tasks[index], ...body }
  return NextResponse.json(tasks[index])
}

// DELETE — remove task by id
export async function DELETE(req: NextRequest): Promise<NextResponse<{ success: boolean }>> {
  const { id } = await req.json()
  tasks = tasks.filter((t) => t.id !== id)
  return NextResponse.json({ success: true })
}