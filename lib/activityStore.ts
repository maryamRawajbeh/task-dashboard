import { ActivityLog, ActionType } from "@/types"
import {
  addActivityLogToDb,
  getAllActivityLogsFromDb,
  getTaskActivityLogsFromDb,
  getUserActivityLogsFromDb,
  getActivityLogsByActionFromDb,
  getActivityLogsByDateRangeFromDb,
  getTotalActivityLogsCountFromDb,
} from "@/lib/db/activityLogs"

/**
 * Add a new activity log entry
 */
export function addLog(
  taskId: number,
  taskTitle: string,
  action: ActionType,
  userEmail: string,
  userName: string,
  details: string,
  oldValue?: string,
  newValue?: string
): ActivityLog | null {
  return addActivityLogToDb({
    taskId,
    taskTitle,
    action,
    userEmail,
    userName,
    details,
    oldValue,
    newValue,
  })
}

/**
 * Get all activity logs (most recent first)
 */
export function getAllLogs(): ActivityLog[] {
  const logs = getAllActivityLogsFromDb()
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Get logs for a specific task
 */
export function getTaskLogs(taskId: number): ActivityLog[] {
  const logs = getTaskActivityLogsFromDb(taskId)
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

export function getUserLogs(userEmail: string): ActivityLog[] {
  const logs = getUserActivityLogsFromDb(userEmail)
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

export function getLogsByAction(action: ActionType): ActivityLog[] {
  const logs = getActivityLogsByActionFromDb(action)
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

export function getLogsByDateRange(startTime: number, endTime: number): ActivityLog[] {
  const logs = getActivityLogsByDateRangeFromDb(startTime, endTime)
  return logs.sort((a, b) => b.timestamp - a.timestamp)
}


export function filterLogs(filters: {
  taskId?: number
  userEmail?: string
  action?: ActionType
  startTime?: number
  endTime?: number
}): ActivityLog[] {
  let logs = getAllActivityLogsFromDb()

  if (filters.taskId) {
    logs = logs.filter((log) => log.taskId === filters.taskId)
  }
  if (filters.userEmail) {
    logs = logs.filter((log) => log.userEmail === filters.userEmail)
  }
  if (filters.action) {
    logs = logs.filter((log) => log.action === filters.action)
  }
  if (filters.startTime) {
    logs = logs.filter((log) => log.timestamp >= filters.startTime!)
  }
  if (filters.endTime) {
    logs = logs.filter((log) => log.timestamp <= filters.endTime!)
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp)
}

export function getTotalLogs(): number {
  return getTotalActivityLogsCountFromDb()
}


export function clearLogs(): void {
  // Not recommended with database, but can be implemented if needed
  console.warn("clearLogs is not recommended with database storage")
}
