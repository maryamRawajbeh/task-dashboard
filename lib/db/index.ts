import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"
import * as path from "path"

// Get database path
const dbPath = path.join(process.cwd(), "task-dashboard.db")

// Create database connection
const sqlite = new Database(dbPath)

// Enable foreign keys
sqlite.pragma("foreign_keys = ON")

// Create drizzle instance
export const db = drizzle(sqlite, { schema })

// Initialize database (create tables and seed)
try {
  console.log("🚀 Initializing database...")

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'User' NOT NULL,
      created_at INTEGER DEFAULT ${Date.now()} NOT NULL,
      updated_at INTEGER DEFAULT ${Date.now()} NOT NULL
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' NOT NULL,
      priority TEXT DEFAULT 'medium' NOT NULL,
      due_date TEXT NOT NULL,
      assignee_email TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER DEFAULT ${Date.now()} NOT NULL,
      updated_at INTEGER DEFAULT ${Date.now()} NOT NULL
    )
  `)

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      task_title TEXT NOT NULL,
      action TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_name TEXT NOT NULL,
      details TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      timestamp INTEGER DEFAULT ${Date.now()} NOT NULL,
      created_at INTEGER DEFAULT ${Date.now()} NOT NULL
    )
  `)

  console.log("✓ Tables ready")

  // Check if data exists
  const existingUsers = db.select().from(schema.users).all()
  if (existingUsers.length === 0) {
    // Seed data
    db.insert(schema.users).values([
      {
        id: "1",
        email: "admin@example.com",
        name: "Admin",
        password: "admin123",
        role: "Admin",
      },
      {
        id: "2", 
        email: "ahmed@example.com",
        name: "Ahmed",
        password: "ahmed123",
        role: "User",
      },
      {
        id: "3",
        email: "sara@example.com", 
        name: "Sara",
        password: "sara123",
        role: "User",
      },
    ])

    db.insert(schema.tasks).values([
      {
        title: "Fix login page bug",
        description: "The login page is showing incorrect error messages",
        status: "in-progress",
        priority: "high",
        dueDate: "2026-03-25",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Update dashboard UI",
        description: "Redesign the dashboard with new colors and layout",
        status: "pending",
        priority: "medium", 
        dueDate: "2026-03-30",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "API performance optimization",
        description: "Improve API response time by 50%",
        status: "completed",
        priority: "high",
        dueDate: "2026-03-20",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
    ])
  }

  console.log("✓ Database initialized successfully!")
} catch (error) {
  console.error("✗ Error initializing database:", error)
}

// Export for migrations
export { sqlite }
