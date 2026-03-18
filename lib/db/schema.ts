import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core"
import { relations } from "drizzle-orm"

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role").default("User").notNull(),
  createdAt: integer("created_at").default(Date.now()).notNull(),
  updatedAt: integer("updated_at").default(Date.now()).notNull(),
})

// Tasks table
export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending").notNull(), // pending, in-progress, completed
  priority: text("priority").default("medium").notNull(), // low, medium, high
  dueDate: text("due_date").notNull(),
  assigneeEmail: text("assignee_email").notNull(),
  createdBy: text("created_by").notNull(), // user email who created it
  createdAt: integer("created_at").default(Date.now()).notNull(),
  updatedAt: integer("updated_at").default(Date.now()).notNull(),
})

// Activity Logs table
export const activityLogs = sqliteTable("activity_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id").notNull(),
  taskTitle: text("task_title").notNull(),
  action: text("action").notNull(), // create, update, delete, status_change, assign
  userEmail: text("user_email").notNull(),
  userName: text("user_name").notNull(),
  details: text("details").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  timestamp: integer("timestamp").default(Date.now()).notNull(),
  createdAt: integer("created_at").default(Date.now()).notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}))

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  assignee: one(users, {
    fields: [tasks.assigneeEmail],
    references: [users.email],
  }),
  creator: one(users, {
    fields: [tasks.createdBy],
    references: [users.email],
  }),
  activityLogs: many(activityLogs),
}))

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [activityLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [activityLogs.userEmail],
    references: [users.email],
  }),
}))
