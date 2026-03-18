import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./task-dashboard.db",
  },
})
