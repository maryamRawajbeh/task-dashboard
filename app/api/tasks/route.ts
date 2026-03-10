import { NextResponse } from "next/server"
import { Task } from "@/types"

const tasks: Task[] = [
  { id: 1, title: "Design system architecture", status: "completed", priority: "high", due: "2025-03-01", assignee: "Ahmed" },
  { id: 2, title: "Implement authentication flow", status: "completed", priority: "high", due: "2025-03-05", assignee: "Sara" },
  { id: 3, title: "Build dashboard UI", status: "completed", priority: "medium", due: "2025-03-08", assignee: "Ahmed" },
  { id: 4, title: "API integration tests", status: "pending", priority: "medium", due: "2026-03-20", assignee: "Sara" },
  { id: 5, title: "Performance optimization", status: "pending", priority: "low", due: "2026-03-25", assignee: "Ahmed" },
  { id: 6, title: "Deploy to production", status: "pending", priority: "high", due: "2026-04-01", assignee: "Sara" },
  { id: 7, title: "Write unit tests", status: "overdue", priority: "medium", due: "2025-02-15", assignee: "Ahmed" },
  { id: 8, title: "Update documentation", status: "overdue", priority: "low", due: "2025-02-20", assignee: "Sara" },
  { id: 9, title: "Code review session", status: "overdue", priority: "medium", due: "2025-02-28", assignee: "Ahmed" },
  { id: 10, title: "Security audit", status: "pending", priority: "high", due: "2026-03-30", assignee: "Sara" },
]

export async function GET(): Promise<NextResponse<Task[]>> {
  await new Promise((r) => setTimeout(r, 400))
  return NextResponse.json(tasks)
}