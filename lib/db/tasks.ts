import { db, sqlite } from "@/lib/db"
import { tasks, activityLogs, users } from "@/lib/db/schema"
import { Task, TaskStatus, TaskPriority } from "@/types"
import { eq, and, desc } from "drizzle-orm"
import { getUserByEmail } from "@/lib/users"

let dbInitialized = false


export function getTasksFromDb(): Task[] {
  try {
    const result = db.select().from(tasks).all()
    return result.map(dbTaskToTask)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

export function getTaskByIdFromDb(id: number): Task | null {
  try {
    const result = db.select().from(tasks).where(eq(tasks.id, id)).all()
    return result.length > 0 ? dbTaskToTask(result[0]) : null
  } catch (error) {
    console.error("Error fetching task:", error)
    return null
  }
}
 
export function createTaskInDb(data: {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate: string
  assigneeEmail: string
  createdBy: string
}): Task | null {
  try {
    const createdAt = Date.now()
    
    db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description || "",
        status: data.status || "pending",
        priority: data.priority || "medium",
        dueDate: data.dueDate,
        assigneeEmail: data.assigneeEmail,
        createdBy: data.createdBy,
        createdAt,
        updatedAt: createdAt,
      })
      .run()

    // Get the last inserted task
    const result = db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.title, data.title),
          eq(tasks.createdBy, data.createdBy),
          eq(tasks.createdAt, createdAt)
        )
      )
      .orderBy(desc(tasks.id))
      .all()
      .at(0)

    return result ? dbTaskToTask(result) : null
  } catch (error) {
    console.error("Error creating task:", error)
    return null
  }
}

 
export function updateTaskInDb(
  id: number,
  data: Partial<{
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    dueDate: string
    assigneeEmail: string
  }>
): Task | null {
  try {
    // Update only provided fields
    const updateData: Record<string, any> = { updatedAt: Date.now() }
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
    if (data.assigneeEmail !== undefined) updateData.assigneeEmail = data.assigneeEmail

    db.update(tasks).set(updateData).where(eq(tasks.id, id)).run()

    return getTaskByIdFromDb(id)
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}

 
export function deleteTaskFromDb(id: number): boolean {
  try {
    db.delete(tasks).where(eq(tasks.id, id)).run()
    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}

 
function dbTaskToTask(dbTask: any): Task {
  const assigneeUser = getUserByEmail(dbTask.assigneeEmail)
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || "",
    status: dbTask.status as TaskStatus,
    priority: dbTask.priority as TaskPriority,
    due: dbTask.dueDate,
    assignee: assigneeUser?.name || dbTask.assigneeEmail, // Fallback to email if user not found
    assigneeEmail: dbTask.assigneeEmail,
    createdBy: dbTask.createdBy,
    createdByName: "", // Will be filled from database if needed
  }
}
