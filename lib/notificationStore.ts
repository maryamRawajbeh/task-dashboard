import { Notification, NotificationType } from "@/types"
import {
  addNotificationToDb,
  getUserNotificationsFromDb,
  getUnreadNotificationsFromDb,
  markNotificationAsReadFromDb,
  markAllNotificationsAsReadFromDb,
  deleteNotificationFromDb,
  getNotificationsByTypeFromDb,
  getTaskNotificationsFromDb,
  getUnreadNotificationCountFromDb,
} from "@/lib/db/notifications"

/**
 * Add a new notification
 */
export function addNotification(data: {
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
  return addNotificationToDb(data)
}

/**
 * Get all notifications for a user (most recent first)
 */
export function getUserNotifications(userEmail: string): Notification[] {
  return getUserNotificationsFromDb(userEmail)
}

/**
 * Get unread notifications for a user
 */
export function getUnreadNotifications(userEmail: string): Notification[] {
  return getUnreadNotificationsFromDb(userEmail)
}

/**
 * Mark a single notification as read
 */
export function markAsRead(notificationId: number): Notification | null {
  return markNotificationAsReadFromDb(notificationId)
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userEmail: string): boolean {
  return markAllNotificationsAsReadFromDb(userEmail)
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: number): boolean {
  return deleteNotificationFromDb(notificationId)
}

/**
 * Get notifications by type for a user
 */
export function getNotificationsByType(
  userEmail: string,
  type: NotificationType
): Notification[] {
  return getNotificationsByTypeFromDb(userEmail, type)
}

/**
 * Get notifications for a specific task
 */
export function getTaskNotifications(taskId: number): Notification[] {
  return getTaskNotificationsFromDb(taskId)
}

/**
 * Get count of unread notifications for a user
 */
export function getUnreadCount(userEmail: string): number {
  return getUnreadNotificationCountFromDb(userEmail)
}
