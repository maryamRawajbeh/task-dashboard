"use client"
import { useEffect, useState, CSSProperties, FormEvent } from "react"
import { useSession, signOut } from "next-auth/react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Task, TaskStats, TaskStatus, TaskPriority } from "@/types"

const STATUS_COLOR: Record<string, string> = { completed: "#22c55e", pending: "#f59e0b", "in-progress": "#38bdf8" }
const PRIORITY_COLOR: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" }
const EMPTY_FORM = { title: "", description: "", assignee: "", priority: "medium" as TaskPriority, due: "", status: "pending" as TaskStatus }
const PAGE_SIZE = 5

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  // Search & Filters
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterDue, setFilterDue] = useState("")

  // Pagination
  const [page, setPage] = useState(1)

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: Task[]) => { setTasks(data); setLoading(false) })
  }, [])

  // ── Filtered tasks ──────────────────────────────────────────────
  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || t.status === filterStatus
    const matchPriority = filterPriority === "all" || t.priority === filterPriority
    const matchDue = !filterDue || t.due <= filterDue
    return matchSearch && matchStatus && matchPriority && matchDue
  })

  // ── Pagination ──────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, filterStatus, filterPriority, filterDue])

  // ── Stats ───────────────────────────────────────────────────────
  const stats: TaskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
  }
  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending },
    { name: "In Progress", value: stats.inProgress },
  ].filter((d) => d.value > 0)
  const barData = [
    { name: "Completed", count: stats.completed, fill: "#22c55e" },
    { name: "Pending", count: stats.pending, fill: "#f59e0b" },
    { name: "In Progress", count: stats.inProgress, fill: "#38bdf8" },
  ]

  // ── Modal helpers ───────────────────────────────────────────────
  function openCreate() { setEditTask(null); setForm(EMPTY_FORM); setFormError(""); setShowModal(true) }
  function openEdit(task: Task) { setEditTask(task); setForm({ title: task.title, description: task.description, assignee: task.assignee, priority: task.priority, due: task.due, status: task.status }); setFormError(""); setShowModal(true) }

  // ── Save ────────────────────────────────────────────────────────
  async function refreshTasks() {
    const res = await fetch("/api/tasks")
    const data: Task[] = await res.json()
    setTasks(data)
  }

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title.trim() || !form.assignee.trim() || !form.due) { setFormError("Please fill in all required fields."); return }
    setSaving(true)
    if (editTask) {
      await fetch(`/api/tasks/${editTask.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    } else {
      await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    }
    await refreshTasks()
    setSaving(false); setShowModal(false)
  }

  // ── Delete ──────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
    await refreshTasks()
    setDeleteId(null)
  }

  // ── Quick status ────────────────────────────────────────────────
  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    await fetch(`/api/tasks/${task.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) })
    await refreshTasks()
  }

  const hasFilters = search || filterStatus !== "all" || filterPriority !== "all" || filterDue

  // ── Pagination controls ─────────────────────────────────────────
  function pageNumbers(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | "...")[] = [1]
    if (safePage > 3) pages.push("...")
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
    if (safePage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
    return pages
  }

  return (
    <div style={s.page}>
      <div style={s.bgGrid} />

      {/* ── TASK MODAL ──────────────────────────────────────────── */}
      {showModal && (
        <div style={s.overlay} onClick={() => setShowModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editTask ? "Edit Task" : "New Task"}</h2>
              <button style={s.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            {formError && <div style={s.formError}>{formError}</div>}
            <form onSubmit={handleSave} style={s.modalForm}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fix login bug" style={s.input}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What needs to be done?" rows={3}
                  style={{ ...s.input, resize: "vertical", minHeight: "80px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Assignee *</label>
                <input required value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="e.g. Ahmed" style={s.input}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div style={s.row2}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} style={s.select}>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} style={s.select}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Due Date *</label>
                <input required type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })}
                  style={{ ...s.input, colorScheme: "dark" }}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <div style={s.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...s.submitBtn, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "Saving..." : editTask ? "Save Changes" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ──────────────────────────────────────── */}
      {deleteId !== null && (
        <div style={s.overlay} onClick={() => setDeleteId(null)}>
          <div style={{ ...s.modal, maxWidth: "380px" }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ ...s.modalTitle, marginBottom: "12px" }}>Delete Task?</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: "0 0 28px" }}>This action cannot be undone.</p>
            <div style={s.modalActions}>
              <button onClick={() => setDeleteId(null)} style={s.cancelBtn}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ ...s.submitBtn, background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 20px rgba(239,68,68,0.3)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>⬡</span>
          <span style={s.navTitle}>TaskFlow</span>
        </div>
        <div style={s.navRight}>
          <div style={s.userChip}>
            <div style={s.avatar}>{session?.user?.name?.[0] ?? "U"}</div>
            <div>
              <div style={s.userName}>{session?.user?.name}</div>
              <div style={s.userRole}>{session?.user?.role}</div>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })} style={s.logoutBtn}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)" }}>
            Sign out
          </button>
        </div>
      </nav>

      <main style={s.main}>
        {/* ── PAGE HEADER ─────────────────────────────────────── */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Dashboard</h1>
            <p style={s.pageSubtitle}>Track your team&apos;s progress at a glance</p>
          </div>
          <button style={s.newTaskBtn} onClick={openCreate}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)" }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)" }}>
            + New Task
          </button>
        </div>

        {loading ? (
          <div style={s.loadingState}><div style={s.spinner} /><p style={s.loadingText}>Loading your tasks...</p></div>
        ) : (
          <>
            {/* ── STATS ───────────────────────────────────────── */}
            <div style={s.statsGrid}>
              {[
                { label: "Total Tasks",  value: stats.total,      icon: "◈", color: "#7c6af7", bg: "rgba(124,106,247,0.1)" },
                { label: "Completed",    value: stats.completed,  icon: "✓", color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
                { label: "In Progress",  value: stats.inProgress, icon: "◷", color: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
                { label: "Pending",      value: stats.pending,    icon: "·", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
              ].map((card) => (
                <div key={card.label} style={s.statCard}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)" }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)" }}>
                  <div style={{ ...s.statIcon, background: card.bg, color: card.color }}>{card.icon}</div>
                  <div style={{ ...s.statValue, color: card.color }}>{card.value}</div>
                  <div style={s.statLabel}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* ── PROGRESS ────────────────────────────────────── */}
            <div style={s.progressCard}>
              <div style={s.progressHeader}>
                <span style={s.progressTitle}>Overall Completion Rate</span>
                <span style={{ ...s.progressPct, color: completionRate >= 70 ? "#22c55e" : completionRate >= 40 ? "#f59e0b" : "#ef4444" }}>{completionRate}%</span>
              </div>
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${completionRate}%`, background: completionRate >= 70 ? "linear-gradient(90deg,#22c55e,#16a34a)" : "linear-gradient(90deg,#f59e0b,#d97706)" }} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: "10px 0 0" }}>{stats.completed} of {stats.total} tasks completed</p>
            </div>

            {/* ── CHARTS ──────────────────────────────────────── */}
            <div style={s.chartsRow}>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {pieData.map((entry) => <Cell key={entry.name} fill={STATUS_COLOR[entry.name === "In Progress" ? "in-progress" : entry.name.toLowerCase()]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "13px" }} />
                    <Legend iconType="circle" wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={s.chartCard}>
                <h3 style={s.chartTitle}>Task Comparison</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#fff", fontSize: "13px" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>{barData.map((e) => <Cell key={e.name} fill={e.fill} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── SEARCH & FILTERS ────────────────────────────── */}
            <div style={s.filterBar}>
              <div style={s.searchWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks by title..." style={s.searchInput}
                  onFocus={(e) => (e.target.style.borderColor = "#7c6af7")} onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")} />
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={s.filterSelect}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={s.filterSelect}>
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input type="date" value={filterDue} onChange={(e) => setFilterDue(e.target.value)} style={{ ...s.filterSelect, colorScheme: "dark", minWidth: "150px" }} title="Due on or before" />
              {hasFilters && (
                <button onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); setFilterDue("") }} style={s.clearBtn}>Clear ✕</button>
              )}
            </div>

            {/* ── TASK TABLE ──────────────────────────────────── */}
            <div style={s.tableCard}>
              <div style={s.tableHeader}>
                <h3 style={s.chartTitle}>
                  Tasks
                  <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "10px" }}>
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </span>
                </h3>
              </div>

              {filtered.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIcon}>🔍</div>
                  <h3 style={s.emptyTitle}>No tasks found</h3>
                  <p style={s.emptyText}>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <>
                  <div style={s.tableWrap}>
                    <table style={s.table}>
                      <thead>
                        <tr>
                          {["Title", "Description", "Assignee", "Priority", "Due Date", "Status", "Actions"].map((h) => (
                            <th key={h} style={s.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.map((task, i) => (
                          <tr key={task.id} style={{ ...s.tr, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                            <td style={{ ...s.td, fontWeight: 500, maxWidth: "160px" }}>{task.title}</td>
                            <td style={{ ...s.td, color: "rgba(255,255,255,0.45)", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {task.description || "—"}
                            </td>
                            <td style={s.td}>{task.assignee}</td>
                            <td style={s.td}>
                              <span style={{ ...s.badge, color: PRIORITY_COLOR[task.priority], background: `${PRIORITY_COLOR[task.priority]}18`, border: `1px solid ${PRIORITY_COLOR[task.priority]}33` }}>
                                {task.priority}
                              </span>
                            </td>
                            <td style={{ ...s.td, color: "rgba(255,255,255,0.5)" }}>{task.due}</td>
                            <td style={s.td}>
                              <select value={task.status} onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                                style={{ ...s.statusSelect, color: STATUS_COLOR[task.status], borderColor: `${STATUS_COLOR[task.status]}44`, background: `${STATUS_COLOR[task.status]}10` }}>
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td style={s.td}>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => openEdit(task)} style={s.editBtn}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,106,247,0.2)" }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,106,247,0.08)" }}>Edit</button>
                                <button onClick={() => setDeleteId(task.id)} style={s.deleteBtn}
                                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)" }}
                                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)" }}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── PAGINATION ────────────────────────────── */}
                  <div style={s.pagination}>
                    <span style={s.pageInfo}>
                      Page <strong>{safePage}</strong> of <strong>{totalPages}</strong>
                      <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: "8px" }}>({filtered.length} tasks)</span>
                    </span>
                    <div style={s.pageControls}>
                      {/* Previous */}
                      <button onClick={() => setPage((p) => p - 1)} disabled={safePage === 1}
                        style={{ ...s.pageBtn, opacity: safePage === 1 ? 0.3 : 1, cursor: safePage === 1 ? "not-allowed" : "pointer" }}>← Prev</button>

                      {/* Page numbers */}
                      {pageNumbers().map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} style={s.pageDots}>…</span>
                        ) : (
                          <button key={p} onClick={() => setPage(p as number)}
                            style={{ ...s.pageBtn, ...(safePage === p ? s.pageBtnActive : {}) }}>
                            {p}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button onClick={() => setPage((p) => p + 1)} disabled={safePage === totalPages}
                        style={{ ...s.pageBtn, opacity: safePage === totalPages ? 0.3 : 1, cursor: safePage === totalPages ? "not-allowed" : "pointer" }}>Next →</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        * { box-sizing: border-box; }
        option { background: #1a1a2e; color: #fff; }
      `}</style>
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", position: "relative" },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(124,106,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.03) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal: { background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "36px", width: "100%", maxWidth: "500px", animation: "fadeIn 0.2s ease", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" },
  closeBtn: { background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "8px", color: "rgba(255,255,255,0.5)", width: "32px", height: "32px", cursor: "pointer", fontSize: "14px" },
  modalForm: { display: "flex", flexDirection: "column", gap: "18px" },
  formError: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "10px 14px", color: "#f87171", fontSize: "13px", marginBottom: "4px" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  modalActions: { display: "flex", gap: "12px", marginTop: "8px" },
  cancelBtn: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "rgba(255,255,255,0.6)", padding: "14px", fontSize: "14px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  submitBtn: { flex: 2, background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", border: "none", borderRadius: "12px", color: "#fff", padding: "14px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif", boxShadow: "0 4px 20px rgba(124,106,247,0.3)" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 500, letterSpacing: "0.02em" },
  input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif", width: "100%" },
  select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "13px 16px", color: "#fff", fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif", width: "100%", cursor: "pointer" },
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
  main: { maxWidth: "1300px", margin: "0 auto", padding: "40px 32px" },
  pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "16px" },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" },
  pageSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  newTaskBtn: { background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", border: "none", borderRadius: "12px", color: "#fff", padding: "12px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "transform 0.2s", boxShadow: "0 4px 20px rgba(124,106,247,0.3)" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 0", gap: "16px" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(124,106,247,0.2)", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
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
  chartsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "24px" },
  chartCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "28px" },
  chartTitle: { fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 600, margin: "0 0 20px" },
  filterBar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: "1", minWidth: "200px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" },
  searchInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px 12px 40px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif" },
  filterSelect: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", color: "rgba(255,255,255,0.7)", fontSize: "13px", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", color: "#f87171", padding: "12px 16px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "'DM Sans', sans-serif" },
  tableCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" },
  tableHeader: { padding: "24px 28px 0" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 20px", color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { transition: "background 0.15s" },
  td: { padding: "14px 20px", fontSize: "13px", color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.04)" },
  badge: { display: "inline-block", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", textTransform: "capitalize" },
  statusSelect: { border: "1px solid", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", outline: "none", fontFamily: "'DM Sans', sans-serif" },
  editBtn: { background: "rgba(124,106,247,0.08)", border: "1px solid rgba(124,106,247,0.2)", borderRadius: "8px", color: "#a78bfa", padding: "6px 12px", fontSize: "12px", cursor: "pointer", transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif" },
  deleteBtn: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", padding: "6px 12px", fontSize: "12px", cursor: "pointer", transition: "background 0.15s", fontFamily: "'DM Sans', sans-serif" },
  emptyState: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, margin: "0 0 8px" },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  // Pagination
  pagination: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderTop: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap", gap: "12px" },
  pageInfo: { color: "rgba(255,255,255,0.5)", fontSize: "13px" },
  pageControls: { display: "flex", alignItems: "center", gap: "6px" },
  pageBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", padding: "7px 12px", fontSize: "13px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s, color 0.15s" },
  pageBtnActive: { background: "rgba(124,106,247,0.2)", border: "1px solid rgba(124,106,247,0.4)", color: "#a78bfa", fontWeight: 600 },
  pageDots: { color: "rgba(255,255,255,0.3)", padding: "0 4px", fontSize: "13px" },
}