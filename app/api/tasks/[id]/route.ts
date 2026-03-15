import { NextRequest, NextResponse } from "next/server"
import { getTaskById, updateTask, deleteTask } from "@/lib/taskStore"
import { Task } from "@/types"

// PUT /api/tasks/:id — update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Task | { error: string }>> {
  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    if (!getTaskById(id)) return NextResponse.json({ error: "Task not found" }, { status: 404 })
    const body = await req.json()
    const updated = updateTask(id, body)
    return NextResponse.json(updated!)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/tasks/:id — delete a task
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id: rawId } = await params
  const id = parseInt(rawId)
  if (isNaN(id)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
  const deleted = deleteTask(id)
  if (!deleted) return NextResponse.json({ error: "Task not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}