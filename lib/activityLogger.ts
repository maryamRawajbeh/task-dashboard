import { addLog } from "@/lib/activityStore"
import { ActionType } from "@/types"

 
export function logTaskCreation(
  taskId: number,
  taskTitle: string,
  userEmail: string,
  userName: string
) {
  addLog(taskId, taskTitle, "create", userEmail, userName, `Created task: ${taskTitle}`)
}

 
export function logTaskDeletion(
  taskId: number,
  taskTitle: string,
  userEmail: string,
  userName: string
) {
  addLog(taskId, taskTitle, "delete", userEmail, userName, `Deleted task: ${taskTitle}`)
}

 
export function logStatusChange(
  taskId: number,
  taskTitle: string,
  userEmail: string,
  userName: string,
  oldStatus: string,
  newStatus: string
) {
  addLog(
    taskId,
    taskTitle,
    "status_change",
    userEmail,
    userName,
    `Changed status from ${oldStatus} to ${newStatus}`,
    oldStatus,
    newStatus
  )
}

 
export function logTaskAssignment(
  taskId: number,
  taskTitle: string,
  userEmail: string,
  userName: string,
  oldAssignee: string,
  newAssignee: string
) {
  addLog(
    taskId,
    taskTitle,
    "assign",
    userEmail,
    userName,
    `Changed assignee from ${oldAssignee} to ${newAssignee}`,
    oldAssignee,
    newAssignee
  )
}

 
export function logTaskUpdate(
  taskId: number,
  taskTitle: string,
  userEmail: string,
  userName: string,
  field: string,
  oldValue: string,
  newValue: string
) {
  addLog(
    taskId,
    taskTitle,
    "update",
    userEmail,
    userName,
    `Updated ${field}: "${oldValue}" → "${newValue}"`,
    oldValue,
    newValue
  )
}
