import { db } from "@/lib/db"
import { notifications } from "@/lib/db/schema"
import { Notification, NotificationType } from "@/types"
import { eq, and, desc } from "drizzle-orm"

/**
 * Add a notification to database
 */
export function addNotificationToDb(data: {
  taskId: number
  taskTitle: string
  type: NotificationType
  recipientEmail: string
  recipientName: string
  triggerUserEmail: string
  triggerUserName: string
  message: string
  metadata?: Record<string, any>
}): Notification | null {
  try {
    const timestamp = Date.now()
    
    const dbData = {
      taskId: data.taskId,
      taskTitle: data.taskTitle,
      type: data.type,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      triggerUserEmail: data.triggerUserEmail,
      triggerUserName: data.triggerUserName,
      message: data.message,
      isRead: 0,
      timestamp,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    }

    db.insert(notifications).values(dbData).run()

    // Retrieve the newly inserted notification
    const insertedNotification = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientEmail, data.recipientEmail),
          eq(notifications.timestamp, timestamp)
        )
      )
      .orderBy(desc(notifications.id))
      .all()
      .at(0)

    if (!insertedNotification) {
      return null
    }

    return dbNotificationToNotification(insertedNotification)
  } catch (error) {
    console.error("Error adding notification:", error)
    return null
  }
}

/**
 * Get all notifications for a user
 */
export function getUserNotificationsFromDb(
  userEmail: string
): Notification[] {
  try {
    const result = db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientEmail, userEmail))
      .orderBy(desc(notifications.timestamp))
      .all()
    return result.map(dbNotificationToNotification)
  } catch (error) {
    console.error("Error fetching user notifications:", error)
    return []
  }
}

/**
 * Get unread notifications for a user
 */
export function getUnreadNotificationsFromDb(
  userEmail: string
): Notification[] {
  try {
    const result = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientEmail, userEmail),
          eq(notifications.isRead, 0)
        )
      )
      .orderBy(desc(notifications.timestamp))
      .all()
    return result.map(dbNotificationToNotification)
  } catch (error) {
    console.error("Error fetching unread notifications:", error)
    return []
  }
}

/**
 * Mark notification as read
 */
export function markNotificationAsReadFromDb(
  notificationId: number
): Notification | null {
  try {
    const result = db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, notificationId))
      .run()

    const notification = db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    })

    return notification
      ? dbNotificationToNotification(notification)
      : null
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return null
  }
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsReadFromDb(
  userEmail: string
): boolean {
  try {
    db.update(notifications)
      .set({ isRead: 1 })
      .where(
        and(
          eq(notifications.recipientEmail, userEmail),
          eq(notifications.isRead, 0)
        )
      )
      .run()
    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}

/**
 * Delete a notification
 */
export function deleteNotificationFromDb(notificationId: number): boolean {
  try {
    db.delete(notifications)
      .where(eq(notifications.id, notificationId))
      .run()
    return true
  } catch (error) {
    console.error("Error deleting notification:", error)
    return false
  }
}

/**
 * Get notifications by type for a user
 */
export function getNotificationsByTypeFromDb(
  userEmail: string,
  type: NotificationType
): Notification[] {
  try {
    const result = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientEmail, userEmail),
          eq(notifications.type, type)
        )
      )
      .orderBy(desc(notifications.timestamp))
      .all()
    return result.map(dbNotificationToNotification)
  } catch (error) {
    console.error("Error fetching notifications by type:", error)
    return []
  }
}

/**
 * Get notifications for a specific task
 */
export function getTaskNotificationsFromDb(taskId: number): Notification[] {
  try {
    const result = db
      .select()
      .from(notifications)
      .where(eq(notifications.taskId, taskId))
      .orderBy(desc(notifications.timestamp))
      .all()
    return result.map(dbNotificationToNotification)
  } catch (error) {
    console.error("Error fetching task notifications:", error)
    return []
  }
}

/**
 * Get count of unread notifications for a user
 */
export function getUnreadNotificationCountFromDb(userEmail: string): number {
  try {
    const result = db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientEmail, userEmail),
          eq(notifications.isRead, 0)
        )
      )
      .all()
    return result.length ?? 0
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    return 0
  }
}

/**
 * Convert database notification to Notification interface
 */
function dbNotificationToNotification(dbNotif: any): Notification {
  return {
    id: dbNotif.id,
    taskId: dbNotif.taskId,
    taskTitle: dbNotif.taskTitle,
    type: dbNotif.type as NotificationType,
    recipientEmail: dbNotif.recipientEmail,
    recipientName: dbNotif.recipientName,
    triggerUserEmail: dbNotif.triggerUserEmail,
    triggerUserName: dbNotif.triggerUserName,
    message: dbNotif.message,
    isRead: dbNotif.isRead === 1,
    timestamp: dbNotif.timestamp,
    metadata: dbNotif.metadata ? JSON.parse(dbNotif.metadata) : undefined,
  }
}
