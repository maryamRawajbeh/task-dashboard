import { NextRequest, NextResponse } from "next/server"
import { getAllLogs, getTaskLogs, getUserLogs, getLogsByAction, getLogsByDateRange, filterLogs } from "@/lib/activityStore"
import { ActivityLog, ActionType } from "@/types"
import { getSessionWithRole } from "@/lib/apiAuth"

export async function GET(req: NextRequest): Promise<NextResponse<ActivityLog[] | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only Admin can view all logs
  if (session.role !== "Admin") {
    return NextResponse.json({ error: "Only admins can view activity logs" }, { status: 403 })
  }

  try {
    const searchParams = req.nextUrl.searchParams
    const taskId = searchParams.get("taskId") ? parseInt(searchParams.get("taskId")!) : undefined
    const userEmail = searchParams.get("userEmail") || undefined
    const action = (searchParams.get("action") || undefined) as ActionType | undefined
    const startTime = searchParams.get("startTime") ? parseInt(searchParams.get("startTime")!) : undefined
    const endTime = searchParams.get("endTime") ? parseInt(searchParams.get("endTime")!) : undefined

    // If no filters provided, return all logs
    if (!taskId && !userEmail && !action && !startTime && !endTime) {
      return NextResponse.json(getAllLogs())
    }

    // Use filter function for complex queries
    const logs = filterLogs({ taskId, userEmail, action, startTime, endTime })
    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
