import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function getSessionWithRole() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  return {
    userId: session.user.email || "",
    userEmail: session.user.email || "",
    userName: session.user.name || "",
    role: (session.user as any).role || "User",
  }
}

export function createUnauthorizedResponse(message: string = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function createForbiddenResponse(message: string = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 })
}
