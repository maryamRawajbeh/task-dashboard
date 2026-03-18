"use client"
import { useEffect, useState, CSSProperties } from "react"
import { useSession, signOut } from "next-auth/react"
import { ActivityLog, ActionType } from "@/types"
import Link from "next/link"

const ACTION_ICONS: Record<ActionType, string> = {
  create: "✨",
  update: "✏️",
  delete: "🗑️",
  status_change: "🔄",
  assign: "👤",
}

const ACTION_COLORS: Record<ActionType, string> = {
  create: "#22c55e",
  update: "#38bdf8",
  delete: "#ef4444",
  status_change: "#f59e0b",
  assign: "#a78bfa",
}

export default function ActivityPage() {
  const { data: session } = useSession()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterAction, setFilterAction] = useState<ActionType | "all">("all")
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    try {
      const res = await fetch("/api/activity")
      if (!res.ok) {
        setError(res.status === 403 ? "Only admins can view activity logs" : "Failed to fetch activity logs")
        setLoading(false)
        return
      }
      const data: ActivityLog[] = await res.json()
      setLogs(data)
      setError("")
    } catch {
      setError("Failed to fetch activity logs")
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div style={s.page}>
        <div style={s.bgGrid} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={s.accessCard}>
            <div style={s.accessIcon}>🔒</div>
            <h2 style={s.accessTitle}>Access Denied</h2>
            <p style={s.accessText}>Please log in to view activity logs</p>
          </div>
        </div>
      </div>
    )
  }

  if (session.user?.role !== "Admin") {
    return (
      <div style={s.page}>
        <div style={s.bgGrid} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={s.accessCard}>
            <div style={s.accessIcon}>❌</div>
            <h2 style={s.accessTitle}>Access Denied</h2>
            <p style={s.accessText}>Only administrators can view activity logs.</p>
            <button onClick={() => signOut()} style={s.submitBtn}>Sign out</button>
          </div>
        </div>
      </div>
    )
  }

  let filteredLogs = logs
  if (filterAction !== "all") filteredLogs = filteredLogs.filter((l) => l.action === filterAction)
  if (search) filteredLogs = filteredLogs.filter((l) =>
    l.taskTitle.toLowerCase().includes(search.toLowerCase()) ||
    l.userName.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase())
  )
  if (sortBy === "oldest") filteredLogs = [...filteredLogs].reverse()

  const statCards = [
    { label: "Total Logs",     value: filteredLogs.length,                                                         icon: "◈", color: "#7c6af7", bg: "rgba(124,106,247,0.1)" },
    { label: "Created",        value: filteredLogs.filter((l) => l.action === "create").length,                    icon: "✨", color: "#22c55e", bg: "rgba(34,197,94,0.1)"   },
    { label: "Updated",        value: filteredLogs.filter((l) => l.action === "update").length,                    icon: "✏️", color: "#38bdf8", bg: "rgba(56,189,248,0.1)"  },
    { label: "Deleted",        value: filteredLogs.filter((l) => l.action === "delete").length,                    icon: "🗑️", color: "#ef4444", bg: "rgba(239,68,68,0.1)"   },
    { label: "Changed",        value: filteredLogs.filter((l) => l.action === "status_change" || l.action === "assign").length, icon: "🔄", color: "#f59e0b", bg: "rgba(245,158,11,0.1)"  },
  ]

  return (
    <div style={s.page}>
      <div style={s.bgGrid} />

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>⬡</span>
          <span style={s.navTitle}>TaskFlow</span>
          <span style={s.navSep}>/</span>
          <span style={s.navSub}>Activity Logs</span>
        </div>
        <div style={s.navRight}>
          <div style={s.userChip}>
            <div style={s.avatar}>{session.user?.name?.[0] ?? "U"}</div>
            <div>
              <div style={s.userName}>{session.user?.name}</div>
              <div style={s.userRole}>{session.user?.role}</div>
            </div>
          </div>
          <Link href="/dashboard" style={s.backBtn}>← Dashboard</Link>
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
        {/* HEADER */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.pageTitle}>Activity Logs</h1>
            <p style={s.pageSubtitle}>Full history of all task actions in the system</p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div style={s.errorBox}>{error}</div>
        )}

        {/* STAT CARDS */}
        <div style={s.statsGrid}>
          {statCards.map((card) => (
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

        {/* FILTERS */}
        <div style={s.filterBar}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search task, user, or action..."
              style={s.searchInput}
              onFocus={(e) => (e.target.style.borderColor = "#7c6af7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value as ActionType | "all")} style={s.filterSelect}>
            <option value="all">All Actions</option>
            <option value="create">✨ Created</option>
            <option value="update">✏️ Updated</option>
            <option value="delete">🗑️ Deleted</option>
            <option value="status_change">🔄 Status Changed</option>
            <option value="assign">👤 Assigned</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "recent" | "oldest")} style={s.filterSelect}>
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
          </select>
          {(search || filterAction !== "all") && (
            <button onClick={() => { setSearch(""); setFilterAction("all") }} style={s.clearBtn}>Clear ✕</button>
          )}
        </div>

        {/* TABLE */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h3 style={s.tableTitle}>
              Logs
              <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.35)", marginLeft: "10px" }}>
                {filteredLogs.length} entries
              </span>
            </h3>
          </div>

          {loading ? (
            <div style={s.loadingState}>
              <div style={s.spinner} />
              <p style={s.loadingText}>Loading activity logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📋</div>
              <h3 style={s.emptyTitle}>No logs found</h3>
              <p style={s.emptyText}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Timestamp", "Action", "Task", "User", "Details"].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={log.id} style={{ ...s.tr, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                      <td style={{ ...s.td, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" as const }}>
                        {new Date(log.timestamp).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td style={s.td}>
                        <span style={{
                          display: "inline-block", padding: "4px 12px", borderRadius: "999px",
                          background: `${ACTION_COLORS[log.action]}18`,
                          border: `1px solid ${ACTION_COLORS[log.action]}44`,
                          color: ACTION_COLORS[log.action],
                          fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" as const,
                        }}>
                          {ACTION_ICONS[log.action]} {log.action.replace("_", " ")}
                        </span>
                      </td>
                      <td style={s.td}>
                        <Link href="/dashboard" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "13px" }}>
                          #{log.taskId} {log.taskTitle}
                        </Link>
                      </td>
                      <td style={{ ...s.td, color: "rgba(255,255,255,0.7)" }}>{log.userName}</td>
                      <td style={s.td}>
                        <div style={{ fontSize: "13px" }}>{log.details}</div>
                        {log.oldValue && log.newValue && (
                          <div style={{ fontSize: "11px", marginTop: "4px", color: "rgba(255,255,255,0.35)" }}>
                            <span style={{ color: "#ef4444" }}>"{log.oldValue}"</span>
                            <span style={{ margin: "0 6px" }}>→</span>
                            <span style={{ color: "#22c55e" }}>"{log.newValue}"</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        option { background: #1a1a2e; color: #fff; }
        a { transition: opacity 0.15s; }
        a:hover { opacity: 0.8; }
      `}</style>
    </div>
  )
}

const s: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "#0a0a0f", color: "#fff", position: "relative", fontFamily: "'DM Sans', sans-serif" },
  bgGrid: { position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(124,106,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,106,247,0.03) 1px, transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" },

  // Access denied
  accessCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px", textAlign: "center", maxWidth: "380px", width: "100%" },
  accessIcon: { fontSize: "48px", marginBottom: "16px" },
  accessTitle: { fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: 800, margin: "0 0 8px" },
  accessText: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: "0 0 24px" },

  // Nav
  nav: { position: "sticky", top: 0, zIndex: 100, height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  navLogo: { fontSize: "22px", color: "#7c6af7" },
  navTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "18px", letterSpacing: "0.02em" },
  navSep: { color: "rgba(255,255,255,0.2)", fontSize: "18px" },
  navSub: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  userChip: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px" },
  userName: { fontSize: "13px", fontWeight: 500, lineHeight: "1.2" },
  userRole: { fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: "1.2" },
  backBtn: { background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.2)", borderRadius: "8px", color: "#a78bfa", padding: "8px 14px", fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap" as const },
  logoutBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", padding: "8px 14px", fontSize: "13px", cursor: "pointer", transition: "background 0.2s", fontFamily: "'DM Sans', sans-serif" },
  submitBtn: { background: "linear-gradient(135deg,#7c6af7,#5b4fe0)", border: "none", borderRadius: "12px", color: "#fff", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "'Syne', sans-serif" },

  // Main
  main: { maxWidth: "1300px", margin: "0 auto", padding: "40px 32px" },
  pageHeader: { marginBottom: "32px" },
  pageTitle: { fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, margin: "0 0 4px", letterSpacing: "-0.02em" },
  pageSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  errorBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "14px 18px", color: "#f87171", fontSize: "14px", marginBottom: "24px" },

  // Stats
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "20px", transition: "transform 0.2s", cursor: "default" },
  statIcon: { width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginBottom: "12px" },
  statValue: { fontFamily: "'Syne', sans-serif", fontSize: "32px", fontWeight: 800, lineHeight: "1", marginBottom: "4px" },
  statLabel: { color: "rgba(255,255,255,0.4)", fontSize: "12px" },

  // Filters
  filterBar: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: "1", minWidth: "200px" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" },
  searchInput: { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px 12px 40px", color: "#fff", fontSize: "14px", outline: "none", transition: "border-color 0.2s", fontFamily: "'DM Sans', sans-serif" },
  filterSelect: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", color: "rgba(255,255,255,0.7)", fontSize: "13px", outline: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  clearBtn: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", color: "#f87171", padding: "12px 16px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" as const },

  // Table
  tableCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", overflow: "hidden" },
  tableHeader: { padding: "24px 28px 0" },
  tableTitle: { fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: 600, margin: "0 0 20px" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 20px", color: "rgba(255,255,255,0.35)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)" },
  tr: { transition: "background 0.15s" },
  td: { padding: "14px 20px", fontSize: "13px", color: "rgba(255,255,255,0.8)", borderBottom: "1px solid rgba(255,255,255,0.04)" },

  // States
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: "16px" },
  spinner: { width: "36px", height: "36px", border: "3px solid rgba(124,106,247,0.2)", borderTopColor: "#7c6af7", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: "14px" },
  emptyState: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, margin: "0 0 8px" },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
}