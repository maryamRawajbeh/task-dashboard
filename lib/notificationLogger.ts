import { addNotification } from "@/lib/notificationStore"
import { NotificationType } from "@/types"

/**
 * Log a task assignment notification
 */
export function notifyTaskAssignment(
  taskId: number,
  taskTitle: string,
  assigneeEmail: string,
  assigneeName: string,
  assignedByEmail: string,
  assignedByName: string,
  oldAssignee?: string
) {
  const message =
    oldAssignee && oldAssignee !== "unassigned"
      ? `Task reassigned to you: "${taskTitle}" (was assigned to ${oldAssignee})`
      : `Task assigned to you: "${taskTitle}"`

  addNotification({
    taskId,
    taskTitle,
    type: "task_assigned",
    recipientEmail: assigneeEmail,
    recipientName: assigneeName,
    triggerUserEmail: assignedByEmail,
    triggerUserName: assignedByName,
    message,
    metadata: {
      oldAssignee,
      newAssignee: assigneeName,
    },
  })
}

/**
 * Log a task status change notification
 */
export function notifyTaskStatusChanged(
  taskId: number,
  taskTitle: string,
  assigneeEmail: string,
  assigneeName: string,
  changedByEmail: string,
  changedByName: string,
  oldStatus: string,
  newStatus: string
) {
  const message = `Task status changed: "${taskTitle}" is now ${newStatus} (was ${oldStatus})`

  addNotification({
    taskId,
    taskTitle,
    type: "task_status_changed",
    recipientEmail: assigneeEmail,
    recipientName: assigneeName,
    triggerUserEmail: changedByEmail,
    triggerUserName: changedByName,
    message,
    metadata: {
      oldStatus,
      newStatus,
    },
  })
}

/**
 * Log a task creation notification (notify assignee)
 */
export function notifyTaskCreated(
  taskId: number,
  taskTitle: string,
  assigneeEmail: string,
  assigneeName: string,
  createdByEmail: string,
  createdByName: string
) {
  const message = `New task created for you: "${taskTitle}"`

  addNotification({
    taskId,
    taskTitle,
    type: "task_created",
    recipientEmail: assigneeEmail,
    recipientName: assigneeName,
    triggerUserEmail: createdByEmail,
    triggerUserName: createdByName,
    message,
  })
}

/**
 * Log a task deletion notification (notify assignee)
 */
export function notifyTaskDeleted(
  taskId: number,
  taskTitle: string,
  wasAssignedTo: string,
  wasAssignedToName: string,
  deletedByEmail: string,
  deletedByName: string
) {
  const message = `Task deleted: "${taskTitle}" has been removed from the system`

  addNotification({
    taskId,
    taskTitle,
    type: "task_deleted",
    recipientEmail: wasAssignedTo,
    recipientName: wasAssignedToName,
    triggerUserEmail: deletedByEmail,
    triggerUserName: deletedByName,
    message,
  })
}
