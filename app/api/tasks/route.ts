import { NextRequest, NextResponse } from "next/server"
import { getAllTasks, createTask } from "@/lib/taskStore"
import { Task } from "@/types"

// GET /api/tasks — return all tasks
export async function GET(): Promise<NextResponse<Task[]>> {
  return NextResponse.json(getAllTasks())
}

// POST /api/tasks — create a new task
export async function POST(req: NextRequest): Promise<NextResponse<Task | { error: string }>> {
  try {
    const body = await req.json()
    if (!body.title || !body.assignee || !body.due) {
      return NextResponse.json({ error: "title, assignee, and due are required" }, { status: 400 })
    }
    const task = createTask(body)
    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}