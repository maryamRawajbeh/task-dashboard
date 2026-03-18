import { UserRole, ROLE_PERMISSIONS } from "@/types"

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole, permission: keyof typeof ROLE_PERMISSIONS['Admin']): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions[permission] ?? false
}

/**
 * Check if user is authorized to view a task
 */
export function canViewTask(userRole: UserRole, taskCreatedBy: string, currentUserEmail: string, assigneeEmail: string): boolean {
  if (hasPermission(userRole, 'viewAllTasks')) return true
  // User can view tasks assigned to them or created by them
  return currentUserEmail === assigneeEmail || currentUserEmail === taskCreatedBy
}

/**
 * Check if user is authorized to edit a task
 */
export function canEditTask(userRole: UserRole, taskCreatedBy: string, currentUserEmail: string, assigneeEmail: string): boolean {
  if (hasPermission(userRole, 'editAnyTask')) return true
  // User can edit their assigned tasks if they have permission
  if (hasPermission(userRole, 'editOwnTask') && (currentUserEmail === assigneeEmail || currentUserEmail === taskCreatedBy)) {
    return true
  }
  return false
}

/**
 * Check if user is authorized to delete a task
 */
export function canDeleteTask(userRole: UserRole, taskCreatedBy: string, currentUserId: string): boolean {
  if (hasPermission(userRole, 'deleteAnyTask')) return true
  // User can delete tasks they created if they have permission
  if (hasPermission(userRole, 'deleteOwnTask') && currentUserId === taskCreatedBy) {
    return true
  }
  return false
}

/**
 * Check if user is authorized to create a task
 */
export function canCreateTask(userRole: UserRole): boolean {
  return hasPermission(userRole, 'createTask')
}

/**
 * Check if user is authorized to assign tasks
 */
export function canAssignTasks(userRole: UserRole): boolean {
  return hasPermission(userRole, 'assignTasks')
}

/**
 * Check if user is authorized to update task status
 */
export function canUpdateTaskStatus(userRole: UserRole): boolean {
  return hasPermission(userRole, 'updateTaskStatus')
}
