import { NextRequest, NextResponse } from "next/server"
import { getTaskById, updateTask, deleteTask } from "@/lib/taskStore"
import { Task } from "@/types"
import { getSessionWithRole, createForbiddenResponse } from "@/lib/apiAuth"
import { canEditTask, canDeleteTask, canUpdateTaskStatus } from "@/lib/rbac"
import { getUserByName, getUserByEmail } from "@/lib/users"
import { logTaskDeletion, logStatusChange, logTaskAssignment, logTaskUpdate } from "@/lib/activityLogger"
import { notifyTaskStatusChanged, notifyTaskAssignment as notifyAssignment, notifyTaskDeleted } from "@/lib/notificationLogger"

// PUT /api/tasks/:id — update a task (with permission checks)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Task | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })

    const task = getTaskById(id)
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    // Check if user has permission to edit this task
    if (!canEditTask(session.role, task.createdBy, session.userEmail, task.assigneeEmail)) {
      return createForbiddenResponse("You don't have permission to edit this task")
    }

    const body = await req.json()

    // If assignee name is provided, convert to email
    if (body.assignee && body.assignee !== task.assignee) {
      const assigneeUser = getUserByName(body.assignee)
      if (!assigneeUser) {
        return NextResponse.json({ error: "Invalid assignee name" }, { status: 400 })
      }
      body.assigneeEmail = assigneeUser.email
    }

    // Users can ONLY update status of their assigned tasks - no other fields
    if (session.role === "User") {
      const allowedFields = ["status"]
      const providedFields = Object.keys(body)
      const hasDisallowedFields = providedFields.some((field) => !allowedFields.includes(field))

      // Must be assigned to this task AND only update status
      if (!session.userEmail || task.assigneeEmail !== session.userEmail) {
        return createForbiddenResponse("You can only update your assigned tasks")
      }

      if (hasDisallowedFields) {
        return createForbiddenResponse("Users can only update task status")
      }
    }

    // Track changes for logging
    const changes = {
      status: body.status !== task.status ? { old: task.status, new: body.status } : null,
      assignee: body.assignee && body.assignee !== task.assignee ? { old: task.assignee, new: body.assignee } : null,
      title: body.title && body.title !== task.title ? { old: task.title, new: body.title } : null,
      description: body.description && body.description !== task.description ? { old: task.description, new: body.description } : null,
      priority: body.priority && body.priority !== task.priority ? { old: task.priority, new: body.priority } : null,
      due: body.due && body.due !== task.due ? { old: task.due, new: body.due } : null,
    }

    const updated = updateTask(id, body)
    
    // Log changes
    if (changes.status) {
      logStatusChange(id, task.title, session.userEmail, session.userName || "Unknown", changes.status.old, changes.status.new)
      
      // Notify the assignee of status change
      notifyTaskStatusChanged(
        id,
        task.title,
        task.assigneeEmail,
        task.assignee,
        session.userEmail,
        session.userName || "Unknown",
        changes.status.old,
        changes.status.new
      )
    }
    if (changes.assignee) {
      logTaskAssignment(id, task.title, session.userEmail, session.userName || "Unknown", changes.assignee.old, changes.assignee.new)
      
      // Notify the new assignee
      const newAssigneeUser = getUserByName(changes.assignee.new)
      if (newAssigneeUser) {
        notifyAssignment(
          id,
          task.title,
          newAssigneeUser.email,
          newAssigneeUser.name,
          session.userEmail,
          session.userName || "Unknown",
          changes.assignee.old
        )
      }
    }
    if (changes.title) {
      logTaskUpdate(id, task.title, session.userEmail, session.userName || "Unknown", "title", changes.title.old, changes.title.new)
    }
    if (changes.description) {
      logTaskUpdate(id, task.title, session.userEmail, session.userName || "Unknown", "description", changes.description.old, changes.description.new)
    }
    if (changes.priority) {
      logTaskUpdate(id, task.title, session.userEmail, session.userName || "Unknown", "priority", changes.priority.old, changes.priority.new)
    }
    if (changes.due) {
      logTaskUpdate(id, task.title, session.userEmail, session.userName || "Unknown", "due date", changes.due.old, changes.due.new)
    }
    
    return NextResponse.json(updated!)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

// DELETE /api/tasks/:id — delete a task (with permission checks)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id: rawId } = await params
    const id = parseInt(rawId)
    if (isNaN(id)) return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })

    const task = getTaskById(id)
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 })

    // Check if user has permission to delete this task
    if (!canDeleteTask(session.role, task.createdBy, session.userEmail)) {
      return createForbiddenResponse("You don't have permission to delete this task")
    }

    // Log the deletion before deleting
    logTaskDeletion(id, task.title, session.userEmail, session.userName || "Unknown")
    
    // Notify the assignee of task deletion
    notifyTaskDeleted(
      id,
      task.title,
      task.assigneeEmail,
      task.assignee,
      session.userEmail,
      session.userName || "Unknown"
    )

    const deleted = deleteTask(id)
    if (!deleted) return NextResponse.json({ error: "Task not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}