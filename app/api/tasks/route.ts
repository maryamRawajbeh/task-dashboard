import { NextRequest, NextResponse } from "next/server"
import { getAllTasks, createTask } from "@/lib/taskStore"
import { Task } from "@/types"
import { getSessionWithRole, createForbiddenResponse } from "@/lib/apiAuth"
import { canViewTask, canCreateTask } from "@/lib/rbac"
import { getUserByName } from "@/lib/users"
import { logTaskCreation } from "@/lib/activityLogger"

// GET /api/tasks — return tasks based on user role
export async function GET(): Promise<NextResponse<Task[] | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allTasks = getAllTasks()

  // Admin can see all tasks
  if (session.role === "Admin") {
    return NextResponse.json(allTasks)
  }

  // Regular users can only see tasks assigned to them
  const userTasks = allTasks.filter((task) => 
    canViewTask(session.role, task.createdBy, session.userEmail, task.assigneeEmail)
  )
  return NextResponse.json(userTasks)
}

// POST /api/tasks — create a new task (only if user has permission)
export async function POST(req: NextRequest): Promise<NextResponse<Task | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user has permission to create tasks
  if (!canCreateTask(session.role)) {
    return createForbiddenResponse("You don't have permission to create tasks")
  }

  try {
    const body = await req.json()
    if (!body.title || !body.assignee || !body.due) {
      return NextResponse.json({ error: "title, assignee, and due are required" }, { status: 400 })
    }

    // Get assignee email from assignee name
    const assigneeUser = getUserByName(body.assignee)
    if (!assigneeUser) {
      return NextResponse.json({ error: "Invalid assignee name" }, { status: 400 })
    }

    // Add createdBy field
    const taskData = { 
      ...body, 
      createdBy: session.userEmail,
      assigneeEmail: assigneeUser.email 
    }
    const task = createTask(taskData)
    
    if (!task) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
    }
    
    // Log the task creation
    logTaskCreation(task.id, task.title, session.userEmail, session.userName || "Unknown")
    
    return NextResponse.json(task, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}