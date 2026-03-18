import { Task, TaskStatus, TaskPriority } from "@/types"
import { getTasksFromDb, getTaskByIdFromDb, createTaskInDb, updateTaskInDb, deleteTaskFromDb } from "@/lib/db/tasks"

/**
 * Get all tasks from database
 */
export function getAllTasks(): Task[] {
  return getTasksFromDb()
}

/**
 * Get task by ID from database
 */
export function getTaskById(id: number): Task | null {
  return getTaskByIdFromDb(id)
}

/**
 * Create a new task in database
 */
export function createTask(data: {
  title: string
  description?: string
  assignee?: string
  assigneeEmail: string
  priority?: TaskPriority
  due: string
  status?: TaskStatus
  createdBy: string
}): Task | null {
  const task = createTaskInDb({
    title: data.title,
    description: data.description,
    assigneeEmail: data.assigneeEmail,
    priority: data.priority || "medium",
    dueDate: data.due,
    status: data.status || "pending",
    createdBy: data.createdBy,
  })

  return task
}

/**
 * Update a task in database
 */
export function updateTask(
  id: number,
  data: Partial<{
    title: string
    description: string
    assignee: string
    assigneeEmail: string
    priority: TaskPriority
    due: string
    status: TaskStatus
  }>
): Task | null {
  const dbData: Partial<{
    title: string
    description: string
    assigneeEmail: string
    priority: TaskPriority
    dueDate: string
    status: TaskStatus
  }> = {}

  if (data.title !== undefined) dbData.title = data.title
  if (data.description !== undefined) dbData.description = data.description
  if (data.assigneeEmail !== undefined) dbData.assigneeEmail = data.assigneeEmail
  if (data.priority !== undefined) dbData.priority = data.priority
  if (data.due !== undefined) dbData.dueDate = data.due
  if (data.status !== undefined) dbData.status = data.status

  return updateTaskInDb(id, dbData)
}

/**
 * Delete a task from database
 */
export function deleteTask(id: number): boolean {
  return deleteTaskFromDb(id)
}