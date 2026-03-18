import { NextRequest, NextResponse } from "next/server"
import { getTaskLogs } from "@/lib/activityStore"
import { ActivityLog } from "@/types"
import { getSessionWithRole } from "@/lib/apiAuth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
): Promise<NextResponse<ActivityLog[] | { error: string }>> {
  const session = await getSessionWithRole()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { taskId: rawTaskId } = await params
    const taskId = parseInt(rawTaskId)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const logs = getTaskLogs(taskId)
    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
