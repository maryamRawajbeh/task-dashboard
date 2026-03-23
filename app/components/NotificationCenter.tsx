"use client"

import { useState, CSSProperties } from "react"
import useSWR from "swr"
import { Notification } from "@/types"

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const NOTIFICATION_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  task_assigned:      { bg: "rgba(168, 85, 247, 0.1)", border: "#a855f7", icon: "👤" },
  task_status_changed:{ bg: "rgba(59, 130, 246, 0.1)",  border: "#3b82f6", icon: "🔄" },
  task_created:       { bg: "rgba(34, 197, 94, 0.1)",   border: "#22c55e", icon: "✨" },
  task_deleted:       { bg: "rgba(239, 68, 68, 0.1)",   border: "#ef4444", icon: "🗑️" },
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all")

  // SWR — بيجيب البيانات بس لما الـ panel مفتوح
  const url = filter === "unread" ? "/api/notifications?type=unread" : "/api/notifications"
  const { data, isLoading, mutate } = useSWR<Notification[]>(
    isOpen ? url : null,   // null = ما يجيب بيانات إذا الـ panel مسكر
    fetcher,
    {
      refreshInterval: 30000,      // كل 30 ثانية بس لما مفتوح
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  )

  const notifications: Notification[] = Array.isArray(data) ? data : []
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const displayed = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  // ── Mark as read — Optimistic ───────────────────────────────────
  async function handleMarkAsRead(id: number) {
    // Optimistic update
    await mutate(notifications.map((n) => n.id === id ? { ...n, isRead: true } : n), false)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, action: "mark_as_read" }),
      })
    } catch { await mutate() }
  }

  // ── Mark all as read — Optimistic ──────────────────────────────
  async function handleMarkAllAsRead() {
    await mutate(notifications.map((n) => ({ ...n, isRead: true })), false)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_as_read" }),
      })
    } catch { await mutate() }
  }

  // ── Delete — Optimistic ─────────────────────────────────────────
  async function handleDelete(id: number) {
    await mutate(notifications.filter((n) => n.id !== id), false)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, action: "delete" }),
      })
    } catch { await mutate() }
  }

  if (!isOpen) return null

  return (
    <>
      <div style={s.overlay} onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()} role="button" tabIndex={0} />
      <div style={s.panel}>
        {/* Header */}
        <div style={s.headerContainer}>
          <div>
            <h2 style={s.title}>Notifications</h2>
            {unreadCount > 0 && <span style={s.unreadBadge}>{unreadCount} unread</span>}
          </div>
          <button onClick={onClose} style={s.closeBtn}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}>✕</button>
        </div>

        {/* Filters */}
        <div style={s.filterContainer}>
          <button onClick={() => setFilter("all")} style={filter === "all" ? { ...s.filterBtn, ...s.filterBtnActive } : s.filterBtn}>All</button>
          <button onClick={() => setFilter("unread")} style={filter === "unread" ? { ...s.filterBtn, ...s.filterBtnActive } : s.filterBtn}>Unread</button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} style={s.markAllBtn}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}>
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div style={s.notificationsList}>
          {isLoading ? (
            <div style={s.loadingState}>
              <div style={s.spinner} />
              <p>Loading...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div style={s.emptyState}>
              <div style={s.emptyIcon}>📭</div>
              <p style={s.emptyText}>No notifications</p>
            </div>
          ) : (
            displayed.map((notif) => {
              const config = NOTIFICATION_COLORS[notif.type] ?? { bg: "rgba(255,255,255,0.05)", border: "#666", icon: "🔔" }
              return (
                <div key={notif.id} style={{ ...s.notificationItem, ...(notif.isRead ? s.notificationItemRead : s.notificationItemUnread), borderLeftColor: config.border, backgroundColor: config.bg }}>
                  <div style={s.notifIcon}>{config.icon}</div>
                  <div style={s.notifContent}>
                    <div style={s.notifMessage}>{notif.message}</div>
                    <div style={s.notifMeta}>
                      <span style={s.notifUser}>by {notif.triggerUserName}</span>
                      <span>{formatTime(notif.timestamp)}</span>
                    </div>
                  </div>
                  <div style={s.notifActions}>
                    {!notif.isRead && (
                      <button onClick={() => handleMarkAsRead(notif.id)} style={s.actionBtn} title="Mark as read">✓</button>
                    )}
                    <button onClick={() => handleDelete(notif.id)} style={s.actionBtn} title="Delete">✕</button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const s = Math.floor(diff / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (s < 60) return "just now"
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (d < 7)  return `${d}d ago`
  return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

const s: Record<string, CSSProperties> = {
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 },
  panel: { position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: "420px", background: "#0a0a0f", borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(0,0,0,0.5)" },
  headerContainer: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  title: { margin: 0, fontSize: "18px", fontWeight: 600, color: "#fff" },
  unreadBadge: { fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "4px", display: "block" },
  closeBtn: { background: "none", border: "none", color: "#fff", fontSize: "20px", cursor: "pointer", padding: 0, transition: "opacity 0.2s" },
  filterContainer: { display: "flex", gap: "8px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  filterBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 500, transition: "all 0.2s" },
  filterBtnActive: { background: "rgba(168,85,247,0.2)", borderColor: "#a855f7", color: "#fff" },
  markAllBtn: { background: "transparent", border: "none", color: "rgba(168,85,247,0.8)", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 500, marginLeft: "auto", transition: "opacity 0.2s" },
  notificationsList: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" },
  notificationItem: { display: "flex", gap: "12px", padding: "12px 16px", borderLeft: "3px solid", borderRadius: "0 6px 6px 0", transition: "background 0.2s", margin: "4px 8px" },
  notificationItemUnread: { background: "rgba(168,85,247,0.12)" },
  notificationItemRead: { opacity: 0.7 },
  notifIcon: { fontSize: "20px", minWidth: "24px", display: "flex", alignItems: "center" },
  notifContent: { flex: 1, minWidth: 0 },
  notifMessage: { fontSize: "13px", color: "#fff", lineHeight: "1.4", marginBottom: "4px" },
  notifMeta: { display: "flex", gap: "12px", fontSize: "11px", color: "rgba(255,255,255,0.4)" },
  notifUser: { fontWeight: 500 },
  notifActions: { display: "flex", gap: "6px", alignItems: "center" },
  actionBtn: { background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: "28px", height: "28px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" },
  loadingState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "rgba(255,255,255,0.5)" },
  spinner: { width: "32px", height: "32px", border: "2px solid rgba(255,255,255,0.2)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "12px" },
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)" },
  emptyIcon: { fontSize: "40px", marginBottom: "12px" },
  emptyText: { fontSize: "14px", margin: 0 },
}