import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

 
export function getUserByEmailFromDb(email: string) {
  try {
    const result = db.query.users.findFirst({
      where: eq(users.email, email),
    })
    return result || null
  } catch (error) {
    console.error("Error fetching user by email:", error)
    return null
  }
}

 
export function getUserByIdFromDb(id: string) {
  try {
    const result = db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return result || null
  } catch (error) {
    console.error("Error fetching user by ID:", error)
    return null
  }
}

 
export function getAllUsersFromDb() {
  try {
    const result = db.query.users.findMany()
    return result || []
  } catch (error) {
    console.error("Error fetching all users:", error)
    return []
  }
}


export function createUserInDb(data: { id: string; email: string; name: string; password: string; role?: string }) {
  try {
    db.insert(users)
      .values({
        id: data.id,
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || "User",
      })
      .run()

    return getUserByEmailFromDb(data.email)
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

 
export function updateUserInDb(email: string, data: Partial<{ name: string; password: string; role: string }>) {
  try {
    const updateData: Record<string, any> = { updatedAt: Date.now() }
    if (data.name !== undefined) updateData.name = data.name
    if (data.password !== undefined) updateData.password = data.password
    if (data.role !== undefined) updateData.role = data.role

    db.update(users).set(updateData).where(eq(users.email, email)).run()

    return getUserByEmailFromDb(email)
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

 
export function userExistsInDb(email: string): boolean {
  try {
    const result = getUserByEmailFromDb(email)
    return result !== null
  } catch {
    return false
  }
}
