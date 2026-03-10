export type TaskStatus = "completed" | "pending" | "overdue"
export type TaskPriority = "high" | "medium" | "low"

export interface Task {
  id: number
  title: string
  status: TaskStatus
  priority: TaskPriority
  due: string
  assignee: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
}