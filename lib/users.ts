// Available users in the system for task assignment
export interface SystemUser {
  name: string
  email: string
  role: "Admin" | "User"
}

export const AVAILABLE_USERS: SystemUser[] = [
  { name: "Admin", email: "admin@example.com", role: "Admin" },
  { name: "Ahmed", email: "ahmed@example.com", role: "User" },
  { name: "Sara", email: "sara@example.com", role: "User" },
]

export function getUserByEmail(email: string): SystemUser | undefined {
  return AVAILABLE_USERS.find((u) => u.email === email)
}

export function getUserByName(name: string): SystemUser | undefined {
  return AVAILABLE_USERS.find((u) => u.name === name)
}

export function getAllUsers(): SystemUser[] {
  return AVAILABLE_USERS
}
