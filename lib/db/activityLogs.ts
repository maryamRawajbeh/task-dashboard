import { db } from "@/lib/db"
import { activityLogs } from "@/lib/db/schema"
import { ActivityLog, ActionType } from "@/types"
import { eq, and, gte, lte } from "drizzle-orm"

/**
 * Add an activity log entry to database
 */
export function addActivityLogToDb(data: {
  taskId: number
  taskTitle: string
  action: ActionType
  userEmail: string
  userName: string
  details: string
  oldValue?: string
  newValue?: string
}): ActivityLog | null {
  try {
    const result = db
      .insert(activityLogs)
      .values({
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        action: data.action,
        userEmail: data.userEmail,
        userName: data.userName,
        details: data.details,
        oldValue: data.oldValue,
        newValue: data.newValue,
        timestamp: Date.now(),
      })
      .run()

    if (!result.lastInsertRowid) return null

    const log = db.query.activityLogs.findFirst({
      where: eq(activityLogs.id, Number(result.lastInsertRowid)),
    })

    return log ? dbActivityLogToActivityLog(log) : null
  } catch (error) {
    console.error("Error adding activity log:", error)
    return null
  }
}

/**
 * Get all activity logs from database
 */
export function getAllActivityLogsFromDb(): ActivityLog[] {
  try {
    const result = db.select().from(activityLogs).orderBy(activityLogs.timestamp).all()
    return result.map(dbActivityLogToActivityLog)
  } catch (error) {
    console.error("Error fetching activity logs:", error)
    return []
  }
}

/**
 * Get logs for a specific task
 */
export function getTaskActivityLogsFromDb(taskId: number): ActivityLog[] {
  try {
    const result = db.select().from(activityLogs).where(eq(activityLogs.taskId, taskId)).orderBy(activityLogs.timestamp).all()
    return result.map(dbActivityLogToActivityLog)
  } catch (error) {
    console.error("Error fetching task activity logs:", error)
    return []
  }
}

/**
 * Get logs for a specific user
 */
export function getUserActivityLogsFromDb(userEmail: string): ActivityLog[] {
  try {
    const result = db.select().from(activityLogs).where(eq(activityLogs.userEmail, userEmail)).orderBy(activityLogs.timestamp).all()
    return result.map(dbActivityLogToActivityLog)
  } catch (error) {
    console.error("Error fetching user activity logs:", error)
    return []
  }
}

/**
 * Get logs by action type
 */
export function getActivityLogsByActionFromDb(action: ActionType): ActivityLog[] {
  try {
    const result = db.select().from(activityLogs).where(eq(activityLogs.action, action)).orderBy(activityLogs.timestamp).all()
    return result.map(dbActivityLogToActivityLog)
  } catch (error) {
    console.error("Error fetching activity logs by action:", error)
    return []
  }
}

/**
 * Get logs within a date range
 */
export function getActivityLogsByDateRangeFromDb(startTime: number, endTime: number): ActivityLog[] {
  try {
    const result = db.select().from(activityLogs)
      .where(and(gte(activityLogs.timestamp, startTime), lte(activityLogs.timestamp, endTime)))
      .orderBy(activityLogs.timestamp)
      .all()
    return result.map(dbActivityLogToActivityLog)
  } catch (error) {
    console.error("Error fetching activity logs by date range:", error)
    return []
  }
}

/**
 * Get total number of activity logs
 */
export function getTotalActivityLogsCountFromDb(): number {
  try {
    const result = db.select().from(activityLogs).all()
    return result.length
  } catch (error) {
    console.error("Error counting activity logs:", error)
    return 0
  }
}

/**
 * Convert database activity log to ActivityLog interface
 */
function dbActivityLogToActivityLog(dbLog: any): ActivityLog {
  return {
    id: dbLog.id,
    taskId: dbLog.taskId,
    taskTitle: dbLog.taskTitle,
    action: dbLog.action as ActionType,
    userEmail: dbLog.userEmail,
    userName: dbLog.userName,
    details: dbLog.details,
    timestamp: dbLog.timestamp,
    oldValue: dbLog.oldValue,
    newValue: dbLog.newValue,
  }
}
