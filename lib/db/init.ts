
import { seedDatabase } from "@/lib/db/seed"
export function initializeDatabase(sqlite: any, db: any) {
  console.log("DEBUG: initializeDatabase called with sqlite:", !!sqlite, "db:", !!db)
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

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        task_title TEXT NOT NULL,
        type TEXT NOT NULL,
        recipient_email TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        trigger_user_email TEXT NOT NULL,
        trigger_user_name TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0 NOT NULL,
        timestamp INTEGER DEFAULT ${Date.now()} NOT NULL,
        metadata TEXT,
        created_at INTEGER DEFAULT ${Date.now()} NOT NULL
      )
    `)

    console.log("✓ Tables ready")

    // Seed the database
    seedDatabase(db)

    console.log("✓ Database initialized successfully!")
  } catch (error) {
    console.error("✗ Error initializing database:", error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  console.log("Run initializeDatabase() with sqlite and db instances from your app entry point.")
}
