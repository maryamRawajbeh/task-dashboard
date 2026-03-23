import { NextRequest, NextResponse } from "next/server"
import {
  getUserNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "@/lib/notificationStore"
import { Notification } from "@/types"
import { getSessionWithRole } from "@/lib/apiAuth"

export async function GET(
  req: NextRequest
): Promise<NextResponse<Notification[] | { error: string }| { count: number }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const type = (searchParams.get("type") || undefined) as
      | "all"
      | "unread"
      | undefined
    const countOnly = searchParams.get("count") === "true"
    const userEmail = session.userEmail

    if (countOnly) {
      const count = getUnreadCount(userEmail)
      return NextResponse.json({ count })
    }

    if (type === "unread") {
      const notifications = getUnreadNotifications(userEmail)
      return NextResponse.json(notifications)
    }

    // Get all notifications
    const notifications = getUserNotifications(userEmail)
    return NextResponse.json(notifications)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest
): Promise<NextResponse<Notification | { error: string } | { success: boolean }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { notificationId, action } = body
    const userEmail = session.userEmail

    if (action === "mark_as_read") {
      if (!notificationId) {
        return NextResponse.json(
          { error: "Notification ID is required" },
          { status: 400 }
        )
      }
      const notification = markAsRead(notificationId)
      return NextResponse.json(notification || { error: "Not found" })
    }

    if (action === "mark_all_as_read") {
      const success = markAllAsRead(userEmail)
      return NextResponse.json({ success })
    }

    if (action === "delete") {
      if (!notificationId) {
        return NextResponse.json(
          { error: "Notification ID is required" },
          { status: 400 }
        )
      }
      const success = deleteNotification(notificationId)
      return NextResponse.json({ success })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch {
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}
