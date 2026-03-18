import { users, tasks } from "@/lib/db/schema"

export function seedDatabase(db: any) {
  console.log("🌱 Seeding database...")

  try {
    // Check if data already exists
    const existingUsers = db.select().from(users).all()
    if (existingUsers.length > 0) {
      console.log("✓ Database already seeded")
      return
    }

    // Create default users
    const adminUser = {
      id: "1",
      email: "admin@example.com",
      name: "Admin",
      password: "admin123", 
      role: "Admin",
    }

    const ahmedUser = {
      id: "2",
      email: "ahmed@example.com",
      name: "Ahmed",
      password: "ahmed123",
      role: "User",
    }

    const saraUser = {
      id: "3",
      email: "sara@example.com",
      name: "Sara",
      password: "sara123",
      role: "User",
    }

    db.insert(users)
      .values([adminUser, ahmedUser, saraUser])
      .run()

    console.log("✓ Users created")

    //  sample tasks
    const sampleTasks = [
      {
        title: "Fix login page bug",
        description: "The login page is showing incorrect error messages",
        status: "in-progress" as const,
        priority: "high" as const,
        dueDate: "2026-03-25",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Update dashboard UI",
        description: "Redesign the dashboard with new colors and layout",
        status: "pending" as const,
        priority: "medium" as const,
        dueDate: "2026-03-30",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "API performance optimization",
        description: "Improve API response time by 50%",
        status: "completed" as const,
        priority: "high" as const,
        dueDate: "2026-03-20",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Database migration",
        description: "Migrate from MongoDB to SQLite",
        status: "in-progress" as const,
        priority: "high" as const,
        dueDate: "2026-03-28",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Documentation update",
        description: "Update API documentation",
        status: "pending" as const,
        priority: "low" as const,
        dueDate: "2026-04-05",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "User authentication system",
        description: "Implement OAuth2 authentication",
        status: "pending" as const,
        priority: "high" as const,
        dueDate: "2026-04-10",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Email notification system",
        description: "Set up email notifications for task updates",
        status: "pending" as const,
        priority: "medium" as const,
        dueDate: "2026-03-22",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Testing and QA",
        description: "Complete unit and integration tests",
        status: "pending" as const,
        priority: "medium" as const,
        dueDate: "2026-03-31",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Security audit",
        description: "Perform security audit on the application",
        status: "pending" as const,
        priority: "high" as const,
        dueDate: "2026-04-02",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Deployment setup",
        description: "Configure CI/CD pipeline",
        status: "pending" as const,
        priority: "high" as const,
        dueDate: "2026-04-08",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Mobile app development",
        description: "Build React Native mobile app",
        status: "pending" as const,
        priority: "medium" as const,
        dueDate: "2026-05-15",
        assigneeEmail: "ahmed@example.com",
        createdBy: "admin@example.com",
      },
      {
        title: "Analytics integration",
        description: "Integrate Google Analytics",
        status: "pending" as const,
        priority: "low" as const,
        dueDate: "2026-04-15",
        assigneeEmail: "sara@example.com",
        createdBy: "admin@example.com",
      },
    ]

    db.insert(tasks).values(sampleTasks).run()

    console.log("✓ Tasks created (12 tasks)")
    console.log("✓ Database seeded successfully!")
  } catch (error) {
    console.error("✗ Error seeding database:", error)
  }
}
