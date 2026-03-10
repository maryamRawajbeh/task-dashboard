"use client"
import { useEffect, useState, CSSProperties, FormEvent } from "react"
import { useSession, signOut } from "next-auth/react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Task, TaskStats, TaskStatus, TaskPriority } from "@/types"

const COLORS: Record<string, string> = { completed: "#22c55e", pending: "#f59e0b", overdue: "#ef4444" }
const PRIORITY_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" }

interface NewTaskForm {
  title: string
  assignee: string
  priority: TaskPriority
  due: string
  status: TaskStatus
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [form, setForm] = useState<NewTaskForm>({
    title: "",
    assignee: "",
    priority: "medium",
    due: "",
    status: "pending",
  })

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: Task[]) => { setTasks(data); setLoading(false) })
  }, [])

  function handleAddTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const newTask: Task = { id: tasks.length + 1, ...form }
    setTasks((prev) => [newTask, ...prev])
    setShowModal(false)
    setForm({ title: "", assignee: "", priority: "medium", due: "", status: "pending" })
  }

  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending },
    { name: "Overdue", value: stats.overdue },
  ].filter((d) => d.value > 0)
  const barData = [
    { name: "Completed", count: stats.completed, fill: "#22c55e" },
    { name: "Pending", count: stats.pending, fill: "#f59e0b" },
    { name: "Overdue", count: stats.overdue, fill: "#ef4444" },
  ]

  return (
    <div style={s.page}>
      <div style={s.bgGrid} />

      {/* MODAL */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>New Task</h2>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddTask} style={s.modalForm}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Task Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Fix login bug"
                  style={s.input}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Assignee *</label>
                <input
                  required
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  placeholder="e.g. maryam "
                  style={s.input}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div style={s.row2}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    style={s.select}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                    style={s.select}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Due Date *</label>
                <input
                  required
                  type="date"
                  value={form.due}
                  onChange={(e) => setForm({ ...form, due: e.target.value })}
                  style={{ ...s.input, colorScheme: "dark" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>
              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" style={s.submitBtn}>Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>⬡</span>
          <span style={s.navTitle}> TaskFlow </span>
        </div>
        <div style={s.navRight}>
          <div style={s.userChip}>
            <div style={s.avatar}>{session?.user?.name?.[0] ?? "U"}</div>
            <div>
              <div style={s.userName}>{session?.user?.name}</div>
              <div style={s.userRole}>{session?.user?.role}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={s.logoutBtn}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)" }}
          >
            Sign out
          </button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Track your team&apos;s progress at a glance</p>
          </div>
          <button
            style={s.newTaskBtn}
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)" }}
          >
            + New Task
          </button>
        </div>

        {loading ? (
          <div style={s.loadingState}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>No tasks available</h3>
            <p style={s.emptyText}>Create your first task to get started.</p>
          </div>
        ) : (
          <>
            <div style={s.statsGrid}>
              {[
                { label: "Total Tasks", value: stats.total, icon: "◈", color: "#7c6af7", bg: "rgba(124,106,247,0.1)" },
                { label: "Completed", value: stats.completed, icon: "✓", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                { label: "Pending", value: stats.pending, icon: "◷", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                { label: "Overdue", value: stats.overdue, icon: "!", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
              ].map((card) => (
                <div key={card.label} style={s.statCard}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)" }}
                >
                  <div style={{ ...s.statIcon, background: card.bg, color: card.color }}>{card.icon}</div>
                  <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
                  <div style={s.statLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={s.progressCard}>
              <div style={s.progressHeader}>
                <span style={s.progressTitle}>Overall Completion Rate</span>
                <span style={{ ...s.progressPct, color: completionRate >= 70 ? "#22c55e" : completionRate >= 40 ? "#f59e0b" : "#ef4444" }}>
                  {completionRate}%
                </span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${completionRate}%`, background: completionRate >= 70 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#f59e0b,#d97706)" }} />
              </div>
              <div style={s.progressMeta}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{stats.completed} of {stats.total} tasks completed</span>
              </div>
            </div>

            <div style={s.chartsRow}>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Status Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name.toLowerCase()]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "13px" }} />
                    <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Task Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} barSize={36}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "13px" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {barData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={s.tableCard}>
              <div style={s.tableHeader}>
                <h3 style={s.chartTitle}>Recent Tasks</h3>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["Task", "Assignee", "Priority", "Due Date", "Status"].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 6).map((task, i) => (
                      <tr key={task.id} style={{ ...s.tr, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                        <td style={s.td}>{task.title}</td>
                        <td style={s.td}>{task.assignee}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, color: PRIORITY_COLOR[task.priority], background: `${PRIORITY_COLOR[task.priority]}18`, border: `1px solid ${PRIORITY_COLOR[task.priority]}33` }}>
                            {task.priority}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: "rgba(255,255,255,0.5)" }}>{task.due}</td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, color: COLORS[task.status], background: `${COLORS[task.status]}18`, border: `1px solid ${COLORS[task.status]}33` }}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; }
        option { background: #1a1a2e; color: #fff; }
      `}</style>
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", position: "relative" },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(124,106,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.03) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal: { background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "36px", width: "100%", maxWidth: "480px", animation: "fadeIn 0.2s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  closeBtn: { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", color: "rgba(255,255,255,0.5)", width: "32px", height: "32px", cursor: "pointer", fontSize: "14px" },
  modalForm: { display: "flex", flexDirection: "column", gap: "20px" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  modalActions: { display: "flex", gap: "12px", marginTop: "8px" },
  cancelBtn: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "rgba(255,255,255,0.6)", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  submitBtn: { flex: 2, background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", border: "none", borderRadius: "12px", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 20px rgba(124,106,247,0.3)" },
  select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif", width: "100%", cursor: "pointer" },
  nav: { position: "sticky", top: 0, zIndex: 100, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "22px", color: "#7c6af7" },
  navTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.02em" },
  navRight: { display: "flex", alignItems: "center", gap: "16px" },
  userChip: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px" },
  userName: { fontSize: "13px", fontWeight: 500, lineHeight: "1.2" },
  userRole: { fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: "1.2" },
  logoutBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", padding: "8px 14px", fontSize: "13px", cursor: "pointer", transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif" },
  main: { maxWidth: "1200px", margin: "0 auto", padding: "40px 32px" },
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "16px" },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" },
  pageSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  newTaskBtn: { background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", border: "none", borderRadius: "12px", color: "#fff", padding: "12px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "transform 0.2s", boxShadow: "0 4px 20px rgba(124,106,247,0.3)" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: "16px" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(124,106,247,0.2)", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
  emptyState: { textAlign: "center", padding: "120px 0" },
  emptyIcon: { fontSize: "48px", marginBottom: "16px" },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 700, margin: "0 0 8px" },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "24px", transition: "transform 0.2s", cursor: "default" },
  statIcon: { width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "16px" },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: "36px", fontWeight: 800, lineHeight: "1", marginBottom: "4px" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
  progressCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px", marginBottom: "24px" },
  progressHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  progressTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: "16px" },
  progressPct: { fontFamily: "'Syne', sans-serif", fontSize: "28px", fontWeight: 800 },
  progressTrack: { height: "10px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: "999px", transition: "width 0.8s ease" },
  progressMeta: { marginTop: "10px" },
  chartsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "24px" },
  chartCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px" },
  chartTitle: { fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 600, margin: "0 0 20px" },
  tableCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" },
  tableHeader: { padding: "24px 28px 0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 28px", color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { transition: "background 0.15s" },
  td: { padding: "14px 28px", fontSize: "13px", color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  badge: { display: "inline-block", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "capitalize" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "14px 16px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif" },
}