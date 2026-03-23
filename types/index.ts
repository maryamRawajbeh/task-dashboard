export type TaskStatus = "completed" | "pending" | "in-progress"
export type TaskPriority = "high" | "medium" | "low"
export type UserRole = "Admin" | "User"
export type ActionType = "create" | "update" | "delete" | "status_change" | "assign"
export type NotificationType = "task_assigned" | "task_status_changed" | "task_created" | "task_deleted"

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due: string
  assignee: string // Name of assignee
  assigneeEmail: string // Email of assignee
  createdBy: string // email of the user who created the task
  createdByName?: string // Name of the user who created the task
}

export interface ActivityLog {
  id: number
  taskId: number
  taskTitle: string
  action: ActionType
  userEmail: string
  userName: string
  details: string // Description of what changed
  timestamp: number // Unix timestamp
  oldValue?: string // For tracking changes
  newValue?: string // For tracking changes
}

export interface Notification {
  id: number
  taskId: number
  taskTitle: string
  type: NotificationType // task_assigned, task_status_changed
  recipientEmail: string // Email of the user receiving the notification
  recipientName: string // Name of the user receiving the notification
  triggerUserEmail: string // Email of the user who triggered the notification
  triggerUserName: string // Name of the user who triggered the notification
  message: string // Human-readable message
  isRead: boolean // Whether the notification has been read
  timestamp: number // Unix timestamp
  metadata?: Record<string, any> // Additional contextual data (old value, new value, etc.)
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Permission {
  viewAllTasks: boolean
  createTask: boolean
  editOwnTask: boolean
  editAnyTask: boolean
  deleteOwnTask: boolean
  deleteAnyTask: boolean
  assignTasks: boolean
  updateTaskStatus: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  Admin: {
    viewAllTasks: true,
    createTask: true,
    editOwnTask: true,
    editAnyTask: true,
    deleteOwnTask: true,
    deleteAnyTask: true,
    assignTasks: true,
    updateTaskStatus: true,
  },
  User: {
    viewAllTasks: false,
    createTask: false,
    editOwnTask: true,
    editAnyTask: false,
    deleteOwnTask: false,
    deleteAnyTask: false,
    assignTasks: false,
    updateTaskStatus: true,
  },
}